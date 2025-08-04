import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Create client with placeholder values if env vars are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' &&
         supabaseAnonKey !== 'placeholder-anon-key'
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name?: string
          avatar_url?: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string
        }
      }
      properties: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          address: string
          price: number
          description?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          address: string
          price: number
          description?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          address?: string
          price?: number
          description?: string
        }
      }
      sales: {
        Row: {
          id: string
          created_at: string
          user_id: string
          property_id: string
          amount: number
          buyer_name: string
          sale_date: string
          status: 'pending' | 'completed' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          property_id: string
          amount: number
          buyer_name: string
          sale_date: string
          status?: 'pending' | 'completed' | 'cancelled'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          property_id?: string
          amount?: number
          buyer_name?: string
          sale_date?: string
          status?: 'pending' | 'completed' | 'cancelled'
        }
      }
    }
  }
}
