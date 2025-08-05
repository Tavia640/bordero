import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, isEmailConfigured } from '@/lib/supabase'
import { SessionManager } from '@/lib/security'
import LocalAuthService, { LocalUser } from '@/lib/localAuth'
import Logger from '@/lib/logger'

interface AuthContextType {
  user: User | LocalUser | null
  session: Session | null
  loading: boolean
  showSessionWarning: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | string | null, needsConfirmation?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | string | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | string | null }>
  resendConfirmation: (email: string) => Promise<{ error: AuthError | string | null }>
  extendSession: () => void
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
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      Logger.log('Initializing authentication system');

      // Check if using Supabase or local auth
      if (isSupabaseConfigured()) {
        Logger.log('Using Supabase authentication');
        // Get initial Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Start session management if user is logged in
          if (session?.user) {
            startSessionManagement()
          }
        })

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          if (session?.user) {
            startSessionManagement()
          } else {
            stopSessionManagement()
          }
        })

        return () => {
          subscription.unsubscribe()
          stopSessionManagement()
        }
      } else {
        Logger.log('Using local authentication fallback');

        // Use local authentication
        const localUser = LocalAuthService.getCurrentUser()
        setUser(localUser)
        setSession(null)
        setLoading(false)

        if (localUser) {
          Logger.authEvent('Local user session restored', { userId: localUser.id });
          startSessionManagement()
        }
      }
    }

    initializeAuth()

    return () => {
      stopSessionManagement()
    }
  }, [])

  const startSessionManagement = () => {
    SessionManager.start(
      () => setShowSessionWarning(true), // Show warning 5 minutes before timeout
      () => signOut() // Auto sign out after timeout
    )
  }

  const stopSessionManagement = () => {
    SessionManager.stop()
    setShowSessionWarning(false)
  }

  const extendSession = () => {
    setShowSessionWarning(false)
    SessionManager.resetTimer()
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)

      // If Supabase isn't configured, use local auth
      if (!isSupabaseConfigured()) {
        Logger.log('Using local auth for signup', { email });
        const result = await LocalAuthService.signUp(email, password, fullName || 'Usuário');
        if (result.success && result.user) {
          Logger.authEvent('Local signup successful', { userId: result.user.id, email });
          setUser(result.user)
          startSessionManagement()
          return { error: null }
        } else {
          Logger.error('Local signup failed', result.error);
          return { error: result.error || 'Erro ao criar conta' }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('already registered')) {
          return { error: 'Este email já está cadastrado' }
        }
        if (error.message.includes('Invalid email')) {
          return { error: 'Email inválido' }
        }
        if (error.message.includes('Password')) {
          return { error: 'Senha muito fraca. Use pelo menos 6 caracteres' }
        }
        return { error: error.message }
      }

      // Check if user needs email confirmation
      const needsConfirmation = data.user && !data.user.email_confirmed_at && !data.session

      // Create profile record if user was created
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
            },
          ])
          .select()

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't fail registration for profile error
        }
      }

      return {
        error: null,
        needsConfirmation: needsConfirmation
      }
    } catch (error) {
      console.error('SignUp error:', error)
      return { error: 'Erro interno ao criar conta. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // If Supabase isn't configured, use local auth
      if (!isSupabaseConfigured()) {
        Logger.log('Using local auth for signin', { email });
        const result = await LocalAuthService.signIn(email, password);
        if (result.success && result.user) {
          Logger.authEvent('Local signin successful', { userId: result.user.id, email });
          setUser(result.user)
          startSessionManagement()
          return { error: null }
        } else {
          Logger.error('Local signin failed', result.error);
          return { error: result.error || 'Erro ao fazer login' }
        }
      }

      Logger.log('Attempting Supabase signin', { email });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        Logger.error('Supabase signin failed', { error: error.message, email });

        // Handle specific Supabase errors
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email ou senha incorretos' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.' }
        }
        if (error.message.includes('Too many requests')) {
          return { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
        }
        return { error: error.message }
      }

      Logger.authEvent('Supabase signin successful', { email });
      return { error: null }
    } catch (error) {
      console.error('SignIn error:', error)
      return { error: 'Erro interno ao fazer login. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)

      // If Supabase isn't configured, use local auth
      if (!isSupabaseConfigured()) {
        LocalAuthService.signOut()
        setUser(null)
        setSession(null)
        stopSessionManagement()
        return { error: null }
      }

      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const sendPasswordResetEmail = async (email: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Sistema de email não configurado. Use a recuperação local.' }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: 'Erro ao enviar email de recuperação' }
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Sistema de email não configurado' }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/dashboard`,
        }
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Resend confirmation error:', error)
      return { error: 'Erro ao reenviar confirmação' }
    }
  }

  const value = {
    user,
    session,
    loading,
    showSessionWarning,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    resendConfirmation,
    extendSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
