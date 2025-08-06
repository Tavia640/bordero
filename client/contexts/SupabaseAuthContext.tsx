import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { testSupabaseEnvironment } from '@/lib/supabaseWithRetry'
import Logger from '@/lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ 
    error: string | null
    needsConfirmation?: boolean 
  }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  resendConfirmation: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Logger.log('��� Initializing Supabase Authentication')

    // Test environment first
    testSupabaseEnvironment().then(envOk => {
      if (!envOk) {
        Logger.error('❌ Supabase environment test failed')
        setLoading(false)
        return
      }

      // Get initial session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error && error.message.includes('Failed to fetch')) {
          Logger.error('❌ Network connectivity issue:', error.message)
          setLoading(false)
          return
        }

        if (error) {
          Logger.error('Error getting session:', error.message)
        } else {
          Logger.log('Initial session:', session ? 'Found' : 'None')
          setSession(session)
          setUser(session?.user ?? null)
        }
        setLoading(false)
      }).catch(err => {
        Logger.error('Session check failed:', err.message)
        setLoading(false)
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      Logger.log('Auth state change:', event)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle specific events
      if (event === 'SIGNED_IN') {
        Logger.log('✅ User signed in:', session?.user?.email)
      } else if (event === 'SIGNED_OUT') {
        Logger.log('🚪 User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        Logger.log('🔄 Token refreshed')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      Logger.log('📝 Attempting signup:', { email, fullName })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (error) {
        Logger.error('Signup error:', error.message)

        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede. Tente novamente.' }
        }

        // Handle specific errors
        if (error.message.includes('already registered')) {
          return { error: 'Este email já está cadastrado' }
        }
        if (error.message.includes('Invalid email')) {
          return { error: 'Email inválido' }
        }
        if (error.message.includes('Password')) {
          return { error: 'Senha deve ter pelo menos 6 caracteres' }
        }

        return { error: error.message }
      }

      Logger.log('Signup result:', {
        user: data.user?.email,
        needsConfirmation: !data.session
      })

      // If user is created but no session, needs email confirmation
      const needsConfirmation = data.user && !data.session

      if (needsConfirmation) {
        return { error: null, needsConfirmation: true }
      }

      return { error: null }
    } catch (error: any) {
      Logger.error('Signup exception:', error)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede.' }
      }
      return { error: 'Erro interno. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      Logger.log('🔐 Attempting signin:', { email })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        Logger.error('Signin error:', error.message)

        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede.' }
        }

        // Handle specific errors
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email ou senha incorretos' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Email não confirmado. Verifique sua caixa de entrada.' }
        }
        if (error.message.includes('Too many requests')) {
          return { error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
        }

        return { error: error.message }
      }

      Logger.log('✅ Signin successful:', data.user?.email)
      return { error: null }
    } catch (error: any) {
      Logger.error('Signin exception:', error)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede.' }
      }
      return { error: 'Erro interno. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      Logger.log('🚪 Signing out...')

      const { error } = await supabase.auth.signOut()

      if (error) {
        Logger.error('Signout error:', error.message)
        return { error: error.message }
      }

      Logger.log('✅ Signout successful')
      return { error: null }
    } catch (error: any) {
      Logger.error('Signout exception:', error)
      return { error: 'Erro ao fazer logout' }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      Logger.log('🔄 Sending password reset:', { email })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        Logger.error('Password reset error:', error.message)

        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede.' }
        }

        return { error: error.message }
      }

      Logger.log('✅ Password reset email sent')
      return { error: null }
    } catch (error: any) {
      Logger.error('Password reset exception:', error)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { error: 'Erro de conexão. Este ambiente pode ter restrições de rede.' }
      }
      return { error: 'Erro ao enviar email de recuperação' }
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      Logger.log('📧 Resending confirmation:', { email })

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      })

      if (error) {
        Logger.error('Resend confirmation error:', error.message)
        return { error: error.message }
      }

      Logger.log('✅ Confirmation email resent')
      return { error: null }
    } catch (error: any) {
      Logger.error('Resend confirmation exception:', error)
      return { error: 'Erro ao reenviar confirmação' }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
