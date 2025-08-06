// Test Supabase connectivity through server proxy
export const testSupabaseViaServer = async () => {
  try {
    console.log('🔄 Testing Supabase via server proxy...');
    
    const response = await fetch('/api/supabase-test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('��� Server proxy request failed:', response.status);
      return {
        success: false,
        error: `Server returned ${response.status}`,
        details: null
      };
    }

    const data = await response.json();
    console.log('✅ Server proxy response:', data);

    return {
      success: data.success,
      error: data.error || null,
      details: data
    };

  } catch (error: any) {
    console.error('❌ Server proxy test failed:', error.message);
    return {
      success: false,
      error: error.message,
      details: null
    };
  }
};

// Compare client vs server connectivity
export const compareClientServerConnectivity = async () => {
  console.log('🔍 Comparing client vs server connectivity...');
  
  const results = {
    client: false,
    server: false,
    diagnosis: 'unknown'
  };

  // Test server connectivity
  const serverTest = await testSupabaseViaServer();
  results.server = serverTest.success;

  // Test client connectivity (simplified)
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });
    results.client = response.ok || response.status === 401;
  } catch (error: any) {
    console.log('Client test failed:', error.message);
    results.client = false;
  }

  // Diagnose the issue
  if (results.server && results.client) {
    results.diagnosis = 'both_working';
  } else if (results.server && !results.client) {
    results.diagnosis = 'client_cors_issue';
  } else if (!results.server && results.client) {
    results.diagnosis = 'server_config_issue';
  } else {
    results.diagnosis = 'network_or_config_issue';
  }

  console.log('Connectivity comparison:', results);
  return results;
};
