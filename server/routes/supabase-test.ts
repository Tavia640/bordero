import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // Enable CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || req.query.url as string;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || req.query.key as string;

    if (!supabaseUrl || !supabaseKey) {
      res.status(400).json({
        success: false,
        error: 'Missing Supabase URL or key',
        config: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      });
      return;
    }

    console.log('Testing Supabase connectivity from server...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseKey.length);

    // Test 1: Basic health check
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    console.log('Health check status:', healthResponse.status);

    // Test 2: Auth endpoint
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey
      }
    });

    console.log('Auth endpoint status:', authResponse.status);

    const results = {
      success: true,
      serverTime: new Date().toISOString(),
      tests: {
        restEndpoint: {
          status: healthResponse.status,
          ok: healthResponse.ok,
          accessible: healthResponse.status === 200 || healthResponse.status === 401
        },
        authEndpoint: {
          status: authResponse.status,
          ok: authResponse.ok,
          accessible: authResponse.status === 200
        }
      },
      config: {
        url: supabaseUrl,
        keyLength: supabaseKey.length,
        projectId: supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown'
      }
    };

    res.json(results);

  } catch (error: any) {
    console.error('Server-side Supabase test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      serverTime: new Date().toISOString()
    });
  }
}
