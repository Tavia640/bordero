import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Demo users for immediate functionality
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@vendas.com',
    password: 'admin123',
    name: 'Administrador',
    emailVerified: true
  },
  {
    id: '2', 
    email: 'vendedor@vendas.com',
    password: 'vendas123',
    name: 'Vendedor',
    emailVerified: true
  },
  {
    id: '3',
    email: 'demo@demo.com',
    password: '123456',
    name: 'Usuário Demo',
    emailVerified: true
  }
]

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('borderor_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('borderor_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check demo users
      const demoUser = DEMO_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      
      if (demoUser) {
        const user: User = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          emailVerified: demoUser.emailVerified
        }
        
        setUser(user)
        localStorage.setItem('borderor_user', JSON.stringify(user))
        
        return { success: true }
      }
      
      // Check custom registered users
      const registeredUsers = JSON.parse(localStorage.getItem('borderor_registered_users') || '[]')
      const registeredUser = registeredUsers.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      
      if (registeredUser) {
        const user: User = {
          id: registeredUser.id,
          email: registeredUser.email,
          name: registeredUser.name,
          emailVerified: true
        }
        
        setUser(user)
        localStorage.setItem('borderor_user', JSON.stringify(user))
        
        return { success: true }
      }
      
      return { success: false, error: 'Email ou senha incorretos' }
      
    } catch (error) {
      return { success: false, error: 'Erro interno. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if email already exists
      const existingDemo = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingDemo) {
        return { success: false, error: 'Este email já está cadastrado' }
      }
      
      const registeredUsers = JSON.parse(localStorage.getItem('borderor_registered_users') || '[]')
      const existingUser = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        return { success: false, error: 'Este email já está cadastrado' }
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        emailVerified: true,
        createdAt: new Date().toISOString()
      }
      
      registeredUsers.push(newUser)
      localStorage.setItem('borderor_registered_users', JSON.stringify(registeredUsers))
      
      // Auto sign in
      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: true
      }
      
      setUser(user)
      localStorage.setItem('borderor_user', JSON.stringify(user))
      
      return { success: true }
      
    } catch (error) {
      return { success: false, error: 'Erro interno. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('borderor_user')
  }

  const resetPassword = async (email: string) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if email exists
      const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
      const registeredUsers = JSON.parse(localStorage.getItem('borderor_registered_users') || '[]')
      const registeredUser = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
      
      if (demoUser || registeredUser) {
        // In a real app, this would send an email
        return { success: true }
      }
      
      return { success: false, error: 'Email não encontrado' }
      
    } catch (error) {
      return { success: false, error: 'Erro interno. Tente novamente.' }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
