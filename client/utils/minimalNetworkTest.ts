// Minimal network test to isolate connectivity issues
export const testBasicConnectivity = async () => {
  const results = {
    basicFetch: false,
    jsonPlaceholder: false,
    httpbin: false,
    supabaseReach: false,
    error: null as string | null
  };

  console.log('🔍 Starting minimal network test...');

  // Test 1: Basic fetch to a simple endpoint
  try {
    console.log('Testing basic fetch capability...');
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      method: 'GET',
      mode: 'cors'
    });
    results.basicFetch = response.ok;
    console.log('Basic fetch:', results.basicFetch ? '✅' : '❌');
  } catch (error: any) {
    console.log('Basic fetch failed:', error.message);
    results.error = error.message;
  }

  // Test 2: Alternative endpoint
  try {
    console.log('Testing alternative endpoint...');
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      mode: 'cors'
    });
    results.httpbin = response.ok;
    console.log('Httpbin:', results.httpbin ? '✅' : '❌');
  } catch (error: any) {
    console.log('Httpbin failed:', error.message);
  }

  // Test 3: Try to reach Supabase domain (just the domain, not API)
  try {
    console.log('Testing Supabase domain reachability...');
    const response = await fetch('https://supabase.com/', {
      method: 'HEAD',
      mode: 'no-cors' // Try no-cors to bypass CORS issues
    });
    results.supabaseReach = true; // If it doesn't throw, it reached something
    console.log('Supabase domain reachable: ✅');
  } catch (error: any) {
    console.log('Supabase domain unreachable:', error.message);
  }

  return results;
};

export const testSupabaseDirectly = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🎯 Testing Supabase instance directly...');
  console.log('URL:', url);
  console.log('Key present:', !!key);

  if (!url || !key) {
    console.log('❌ Missing URL or key');
    return false;
  }

  // Try different approaches
  const tests = [
    {
      name: 'Basic HEAD request',
      config: {
        method: 'HEAD',
        mode: 'cors' as RequestMode
      }
    },
    {
      name: 'No-CORS request',
      config: {
        method: 'GET',
        mode: 'no-cors' as RequestMode
      }
    },
    {
      name: 'With auth headers',
      config: {
        method: 'GET',
        mode: 'cors' as RequestMode,
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(`${url}/rest/v1/`, test.config);
      console.log(`${test.name}: ${response.status} ${response.statusText}`);
      
      if (response.status === 200 || response.status === 401) {
        console.log(`✅ ${test.name} successful`);
        return true;
      }
    } catch (error: any) {
      console.log(`❌ ${test.name} failed:`, error.message);
    }
  }

  return false;
};
