import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Create multiple client configurations to try
const configs = [
  // Basic configuration
  {
    name: 'basic',
    config: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' as const
      }
    }
  },
  // Minimal configuration
  {
    name: 'minimal',
    config: {}
  },
  // Alternative configuration with different fetch handling
  {
    name: 'custom-fetch',
    config: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: (url: string, options: any = {}) => {
          console.log('Custom fetch to:', url);
          return fetch(url, {
            ...options,
            mode: 'cors',
            credentials: 'omit'
          });
        }
      }
    }
  }
];

export const createSupabaseClientWithRetry = async (): Promise<SupabaseClient | null> => {
  console.log('🔄 Attempting to create Supabase client with retry logic...');
  
  for (const { name, config } of configs) {
    try {
      console.log(`Trying configuration: ${name}`);
      const client = createClient(supabaseUrl, supabaseAnonKey, config);
      
      // Test the client
      const { error } = await client.auth.getSession();
      
      if (!error || error.message.includes('session_not_found')) {
        console.log(`�� Success with ${name} configuration`);
        return client;
      } else {
        console.log(`❌ Failed with ${name} configuration:`, error.message);
      }
    } catch (error: any) {
      console.log(`❌ Exception with ${name} configuration:`, error.message);
    }
  }
  
  console.log('❌ All configurations failed');
  return null;
};

// Test if the environment is accessible
export const testSupabaseEnvironment = async () => {
  console.log('🔍 Testing Supabase environment...');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseAnonKey?.length || 0);
  
  // Basic validation
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    console.error('❌ Invalid or missing VITE_SUPABASE_URL');
    return false;
  }
  
  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-anon-key') {
    console.error('❌ Invalid or missing VITE_SUPABASE_ANON_KEY');
    return false;
  }
  
  // Try to reach the endpoint directly
  try {
    console.log('Testing direct API access...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey
      }
    });
    
    console.log('Direct API response status:', response.status);
    return response.status === 200 || response.status === 401; // Both are OK for health check
  } catch (error: any) {
    console.error('❌ Direct API test failed:', error.message);
    return false;
  }
};
