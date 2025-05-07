import { createServerSupabaseClient } from '../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Get environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    };

    // Create a Supabase client for server-side operations
    const supabase = createServerSupabaseClient();

    // Test the connection by getting the Supabase version
    const { data, error } = await supabase.rpc('version');

    if (error) {
      throw error;
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to Supabase',
      timestamp: new Date().toISOString(),
      version: data,
      environmentVariables: {
        NEXT_PUBLIC_SUPABASE_URL: envVars.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set',
        SUPABASE_DATABASE_URL: envVars.SUPABASE_DATABASE_URL ? '✓ Set' : '✗ Not set',
        SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'
      }
    });
  } catch (error) {
    console.error('Supabase connection test failed:', error);

    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    };

    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to Supabase',
      error: error.message,
      environmentVariables: {
        NEXT_PUBLIC_SUPABASE_URL: envVars.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set',
        SUPABASE_DATABASE_URL: envVars.SUPABASE_DATABASE_URL ? '✓ Set' : '✗ Not set',
        SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'
      }
    });
  }
}
