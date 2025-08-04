import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { SessionManager } from '@/lib/security'
import LocalAuthService, { LocalUser } from '@/lib/localAuth'

interface AuthContextType {
  user: User | LocalUser | null
  session: Session | null
  loading: boolean
  showSessionWarning: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | string | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | string | null }>
  signOut: () => Promise<{ error: AuthError | null }>
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
      // Check if using Supabase or local auth
      if (isSupabaseConfigured()) {
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
        // Use local authentication
        const localUser = LocalAuthService.getCurrentUser()
        setUser(localUser)
        setSession(null)
        setLoading(false)

        if (localUser) {
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
        const result = await LocalAuthService.signUp(email, password, fullName || 'Usuário');
        if (result.success && result.user) {
          setUser(result.user)
          startSessionManagement()
          return { error: null }
        } else {
          return { error: result.error || 'Erro ao criar conta' }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error }
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
            },
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // If Supabase isn't configured, use local auth
      if (!isSupabaseConfigured()) {
        const result = await LocalAuthService.signIn(email, password);
        if (result.success && result.user) {
          setUser(result.user)
          startSessionManagement()
          return { error: null }
        } else {
          return { error: result.error || 'Erro ao fazer login' }
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
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

  const value = {
    user,
    session,
    loading,
    showSessionWarning,
    signUp,
    signIn,
    signOut,
    extendSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
