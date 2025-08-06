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
        console.log(`✅ Success with ${name} configuration`);
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

// Test if the environment is accessible with better error handling
export const testSupabaseEnvironment = async () => {
  console.log('🔍 Testing Supabase environment...');

  // Import validation utility
  const { validateSupabaseConfig, diagnoseConnectionIssue } = await import('@/utils/supabaseValidator');

  // First check configuration
  const validation = validateSupabaseConfig();
  if (!validation.valid) {
    console.error('❌ Configuration validation failed:', validation.issues);
    return false;
  }

  console.log('✅ Configuration validation passed');

  // Try to reach the endpoint with multiple approaches
  const testMethods = [
    {
      name: 'HEAD request',
      test: () => fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: { 'apikey': supabaseAnonKey }
      })
    },
    {
      name: 'OPTIONS request',
      test: () => fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'OPTIONS'
      })
    },
    {
      name: 'No-CORS request',
      test: () => fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        mode: 'no-cors'
      })
    }
  ];

  for (const method of testMethods) {
    try {
      console.log(`Testing ${method.name}...`);
      const response = await method.test();
      console.log(`${method.name} status:`, response.status);

      if (response.status === 200 || response.status === 401 || response.type === 'opaque') {
        console.log(`✅ ${method.name} succeeded`);
        return true;
      }
    } catch (error: any) {
      console.log(`❌ ${method.name} failed:`, error.message);

      // If this is the last method, run diagnosis
      if (method === testMethods[testMethods.length - 1]) {
        const diagnosis = await diagnoseConnectionIssue();
        console.log('🔍 Diagnosis:', diagnosis);
      }
    }
  }

  console.error('❌ All connection methods failed');
  return false;
};
