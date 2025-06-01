import Head from 'next/head';
import SupabaseTest from '../components/SupabaseTest';

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Head>
        <title>Supabase Connection Test | MDTS</title>
        <meta name="description" content="Testing Supabase connection for MDTS" />
      </Head>

      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Client-Side Test</h2>
          <SupabaseTest />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Server-Side Test</h2>
          <ServerSideTest />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <EnvironmentInfo />
      </div>
    </div>
  );
}

function ServerSideTest() {
  const [status, setStatus] = useState('Not tested');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testServerConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/supabase/test-connection');
      const data = await response.json();
      
      if (data.success) {
        setStatus('Success');
        setResult(data);
      } else {
        setStatus('Failed');
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setStatus('Error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="mb-4">
        <p className="font-medium">Status:</p>
        <p className={`${status === 'Success' ? 'text-green-500' : status === 'Failed' || status === 'Error' ? 'text-red-500' : 'text-gray-500'}`}>
          {status}
        </p>
      </div>
      
      <button
        onClick={testServerConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Server Connection'}
      </button>
      
      {error && (
        <div className="mt-4">
          <p className="font-medium">Error:</p>
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <p className="font-medium">Result:</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function EnvironmentInfo() {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <p className="mb-2">
        The following environment variables should be set in your Netlify dashboard:
      </p>
      
      <ul className="list-disc pl-5 space-y-1">
        <li><code className="bg-gray-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
        <li><code className="bg-gray-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key</li>
        <li><code className="bg-gray-100 px-1">SUPABASE_DATABASE_URL</code> - Your Supabase database URL (for server-side)</li>
        <li><code className="bg-gray-100 px-1">SUPABASE_ANON_KEY</code> - Your Supabase anonymous key (for server-side)</li>
      </ul>
      
      <p className="mt-4 text-sm text-gray-500">
        Note: When connecting through the Netlify UI, these variables should be automatically set.
      </p>
    </div>
  );
}

// Import useState for the ServerSideTest component
import { useState } from 'react';
