import { supabase } from '@/lib/supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('🔧 Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test 2: Check if we can access auth API
    try {
      const { data: healthData, error: healthError } = await supabase.auth.getUser()
      if (healthError && !healthError.message.includes('not logged in')) {
        console.error('❌ Auth API not accessible:', healthError.message)
        return false
      }
      console.log('✅ Auth API accessible')
    } catch (e: any) {
      console.error('❌ Auth API test failed:', e.message)
      return false
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Supabase test exception:', error.message)
    return false
  }
}

export const testSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('🔧 Checking Supabase configuration...')
  console.log('URL:', url ? `${url.substring(0, 30)}...` : 'Missing')
  console.log('Key:', key ? `${key.substring(0, 30)}...` : 'Missing')
  
  if (!url || url === 'your_supabase_project_url') {
    console.error('❌ VITE_SUPABASE_URL not configured')
    return false
  }
  
  if (!key || key === 'your_supabase_anon_key') {
    console.error('❌ VITE_SUPABASE_ANON_KEY not configured')
    return false
  }
  
  if (!url.includes('supabase.co')) {
    console.error('❌ Invalid Supabase URL format')
    return false
  }
  
  console.log('✅ Supabase configuration looks good')
  return true
}
