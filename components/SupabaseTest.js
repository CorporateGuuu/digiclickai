import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test the connection by getting the Supabase version
        const { data, error } = await supabase.rpc('version');
        
        if (error) {
          throw error;
        }
        
        setStatus('Connected to Supabase');
        setData(data);
      } catch (err) {
        console.error('Supabase client connection test failed:', err);
        setStatus('Failed to connect to Supabase');
        setError(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>
      
      <div className="mb-4">
        <p className="font-medium">Status:</p>
        <p className={`${status.includes('Failed') ? 'text-red-500' : status.includes('Connected') ? 'text-green-500' : 'text-yellow-500'}`}>
          {status}
        </p>
      </div>
      
      {error && (
        <div className="mb-4">
          <p className="font-medium">Error:</p>
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {data && (
        <div className="mb-4">
          <p className="font-medium">Supabase Version:</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Make sure your Supabase environment variables are properly set in Netlify.</p>
      </div>
    </div>
  );
}
