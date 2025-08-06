import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testNetworkConnectivity, diagnoseSupabaseIssue } from '@/utils/networkTest';
import { testSupabaseEnvironment } from '@/lib/supabaseWithRetry';

export default function SupabaseDiagnostics() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullDiagnostic = async () => {
    setResults([]);
    setTesting(true);
    addResult('🔍 Starting full connectivity diagnostic...');

    try {
      // Test 1: Basic configuration
      addResult('📋 Checking configuration...');
      const configOk = await diagnoseSupabaseIssue();
      addResult(configOk ? '✅ Configuration valid' : '❌ Configuration issues found');

      // Test 2: Network connectivity
      addResult('🌐 Testing network connectivity...');
      const networkResults = await testNetworkConnectivity();
      addResult(`Internet: ${networkResults.general ? '✅' : '❌'}`);
      addResult(`CORS: ${networkResults.cors ? '✅' : '❌'}`);
      addResult(`Supabase: ${networkResults.supabase ? '✅' : '❌'}`);
      
      if (networkResults.error) {
        addResult(`❌ Network error: ${networkResults.error}`);
      }

      // Test 3: Supabase environment
      addResult('🔧 Testing Supabase environment...');
      const envOk = await testSupabaseEnvironment();
      addResult(envOk ? '✅ Supabase environment accessible' : '❌ Supabase environment failed');

      // Test 4: Alternative connectivity test
      addResult('🔍 Testing alternative endpoints...');
      try {
        const altResponse = await fetch('https://httpbin.org/json', { method: 'GET' });
        addResult(altResponse.ok ? '✅ Alternative endpoints work' : '❌ Alternative endpoints fail');
      } catch (e: any) {
        addResult(`❌ Alternative test failed: ${e.message}`);
      }

      // Test 5: Supabase specific endpoints
      addResult('📡 Testing Supabase specific endpoints...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      try {
        // Test auth endpoint specifically
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey
          }
        });
        addResult(`Auth endpoint: ${authResponse.ok ? '✅' : '❌'} (${authResponse.status})`);
      } catch (e: any) {
        addResult(`❌ Auth endpoint failed: ${e.message}`);
      }

      try {
        // Test REST endpoint
        const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey
          }
        });
        addResult(`REST endpoint: ${restResponse.ok ? '✅' : '❌'} (${restResponse.status})`);
      } catch (e: any) {
        addResult(`❌ REST endpoint failed: ${e.message}`);
      }

    } catch (error: any) {
      addResult(`💥 Diagnostic failed: ${error.message}`);
    }

    addResult('🏁 Diagnostic complete');
    setTesting(false);
  };

  const testSimpleFetch = async () => {
    addResult('🧪 Testing simple fetch to external service...');
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();
      addResult(response.ok ? '✅ Simple fetch works' : '❌ Simple fetch failed');
      addResult(`Response: ${data.title ? 'Valid JSON' : 'Invalid response'}`);
    } catch (e: any) {
      addResult(`❌ Simple fetch failed: ${e.message}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Supabase Connectivity Diagnostics</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This tool helps diagnose connectivity issues with Supabase.
            Run the diagnostic to check network, configuration, and endpoint accessibility.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={runFullDiagnostic}
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Running...' : '🔍 Run Full Diagnostic'}
          </Button>
          
          <Button 
            onClick={testSimpleFetch}
            variant="outline"
            className="w-full"
          >
            🧪 Test Simple Fetch
          </Button>
        </div>

        <Button
          onClick={() => setResults([])}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          🧹 Clear Results
        </Button>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-gray-500">No diagnostic results yet...</div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>Current URL: {import.meta.env.VITE_SUPABASE_URL}</div>
          <div>Key Length: {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0}</div>
          <div>App URL: {import.meta.env.VITE_APP_URL || 'Not set'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
