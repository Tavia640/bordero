// Validate Supabase configuration without network calls
export const validateSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const appUrl = import.meta.env.VITE_APP_URL;

  const issues: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Validating Supabase configuration...');
  console.log('URL:', url);
  console.log('Key length:', key?.length || 0);
  console.log('App URL:', appUrl);

  // Check URL
  if (!url || url === 'https://placeholder.supabase.co' || url === 'your_supabase_project_url') {
    issues.push('VITE_SUPABASE_URL not configured or using placeholder');
  } else if (!url.includes('supabase.co')) {
    issues.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
  } else if (!url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL should use HTTPS');
  }

  // Check key
  if (!key || key === 'placeholder-anon-key' || key === 'your_supabase_anon_key') {
    issues.push('VITE_SUPABASE_ANON_KEY not configured or using placeholder');
  } else if (key.length < 20) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  } else if (!key.startsWith('eyJ')) {
    issues.push('VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
  }

  // Check app URL
  if (!appUrl) {
    warnings.push('VITE_APP_URL not configured (needed for email redirects)');
  } else if (!appUrl.startsWith('http')) {
    warnings.push('VITE_APP_URL should include protocol (http:// or https://)');
  }

  // Extract project ID from URL for additional validation
  if (url && url.includes('supabase.co')) {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectId = match[1];
      console.log('Project ID:', projectId);
      
      if (projectId.length < 20) {
        warnings.push('Project ID seems unusually short');
      }
    } else {
      issues.push('Cannot extract project ID from Supabase URL');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    config: {
      url,
      keyLength: key?.length || 0,
      appUrl,
      projectId: url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown'
    }
  };
};

// Create a mock Supabase client for testing configuration
export const createMockSupabaseTest = () => {
  const validation = validateSupabaseConfig();
  
  if (!validation.valid) {
    console.error('❌ Configuration validation failed:', validation.issues);
    return null;
  }

  console.log('✅ Configuration validation passed');
  
  // Return basic config info without network calls
  return {
    url: validation.config.url,
    projectId: validation.config.projectId,
    configured: true,
    keyPresent: validation.config.keyLength > 20
  };
};

// Diagnose network vs configuration issues
export const diagnoseConnectionIssue = async () => {
  console.log('🔍 Diagnosing connection issues...');
  
  // Step 1: Validate configuration
  const validation = validateSupabaseConfig();
  if (!validation.valid) {
    console.log('❌ Configuration issues found:', validation.issues);
    return {
      type: 'configuration',
      issues: validation.issues,
      recommendations: [
        'Check environment variables are set correctly',
        'Verify Supabase URL format',
        'Ensure anon key is valid JWT token'
      ]
    };
  }

  // Step 2: Test if this is a network environment issue
  try {
    // Try a simple test that doesn't require CORS
    const testResult = await fetch('data:text/plain,test');
    console.log('✅ Basic fetch capability works');
  } catch (e) {
    console.log('❌ Basic fetch capability broken');
    return {
      type: 'environment',
      issues: ['Fetch API not working in this environment'],
      recommendations: [
        'This might be a restricted development environment',
        'Try running in a different browser or environment',
        'Check if there are network restrictions'
      ]
    };
  }

  // Step 3: It's likely a network connectivity issue
  return {
    type: 'network',
    issues: ['Cannot reach Supabase servers'],
    recommendations: [
      'Check internet connectivity',
      'Verify firewall/proxy settings',
      'Try from a different network',
      'Check if Supabase is experiencing outages'
    ]
  };
};
