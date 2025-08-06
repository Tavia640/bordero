// Test network connectivity and Supabase access
export const testNetworkConnectivity = async () => {
  const results = {
    general: false,
    supabase: false,
    cors: false,
    error: null as string | null
  };

  try {
    // Test 1: General internet connectivity (to a reliable service)
    console.log('Testing general internet connectivity...');
    const testResponse = await fetch('https://httpbin.org/get', {
      method: 'GET',
      mode: 'cors'
    });
    results.general = testResponse.ok;
    console.log('General connectivity:', results.general ? '✅' : '❌');
  } catch (error: any) {
    console.log('General connectivity failed:', error.message);
  }

  try {
    // Test 2: Supabase URL accessibility
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('Testing Supabase URL:', supabaseUrl);
    
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      results.error = 'Supabase URL not configured';
      return results;
    }

    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      }
    });
    
    results.supabase = healthResponse.status === 200 || healthResponse.status === 401; // 401 is OK for health check
    console.log('Supabase connectivity:', results.supabase ? '✅' : '❌', 'Status:', healthResponse.status);
  } catch (error: any) {
    console.log('Supabase connectivity failed:', error.message);
    results.error = error.message;
  }

  try {
    // Test 3: CORS functionality
    console.log('Testing CORS...');
    const corsResponse = await fetch('https://httpbin.org/headers', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'X-Test': 'cors-test'
      }
    });
    results.cors = corsResponse.ok;
    console.log('CORS test:', results.cors ? '✅' : '❌');
  } catch (error: any) {
    console.log('CORS test failed:', error.message);
  }

  return results;
};

export const diagnoseSupabaseIssue = async () => {
  const config = {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    appUrl: import.meta.env.VITE_APP_URL
  };

  console.log('🔧 Supabase Configuration:');
  console.log('URL:', config.url);
  console.log('Key length:', config.key?.length || 0);
  console.log('App URL:', config.appUrl);

  const issues = [];

  if (!config.url || config.url === 'https://placeholder.supabase.co') {
    issues.push('❌ VITE_SUPABASE_URL not configured');
  }

  if (!config.key || config.key === 'placeholder-anon-key') {
    issues.push('❌ VITE_SUPABASE_ANON_KEY not configured');
  }

  if (!config.appUrl) {
    issues.push('⚠️ VITE_APP_URL not configured (needed for email redirects)');
  }

  if (config.url && !config.url.includes('supabase.co')) {
    issues.push('❌ Invalid Supabase URL format');
  }

  if (issues.length > 0) {
    console.log('📋 Configuration Issues:');
    issues.forEach(issue => console.log(issue));
    return false;
  }

  console.log('✅ Configuration looks correct');
  return true;
};
