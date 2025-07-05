# Supabase Integration for MDTS Tech Store

This directory contains files related to the Supabase integration for the MDTS Tech Store.

## Connecting to Supabase via Netlify

1. Go to the [Netlify Dashboard](https://app.netlify.com/)
2. Select your site (mdtstech)
3. Go to Site Configuration
4. In the sidebar, select 'Supabase'
5. On the Supabase extension card, click 'Connect'
6. Connect your Supabase account
7. Select your Supabase project
8. Choose Next.js as your framework
9. Click 'Save'

This will automatically add the necessary environment variables to your Netlify site.

## Environment Variables

The following environment variables will be set automatically when you connect Supabase via Netlify:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_DATABASE_URL` - Your Supabase database URL (for server-side)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (for server-side)

## Using the Supabase Client

### Client-Side Usage

```javascript
import supabase from '../lib/supabase';

// Example: Fetch products
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(10);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data;
}
```

### Server-Side Usage (API Routes)

```javascript
import { createServerSupabaseClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    // Create a Supabase client for server-side operations
    const supabase = createServerSupabaseClient();
    
    // Example: Fetch products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

## Database Schema

The `schema.sql` file in this directory contains the database schema for the MDTS Tech Store. You can use this file to set up your Supabase database.

To apply the schema:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `schema.sql`
5. Run the query

## Testing the Connection

You can test the Supabase connection by visiting the `/supabase-test` page in your application. This page will show you if the connection is working properly and display any environment variables that are set.

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Make sure the environment variables are set correctly in Netlify
2. Check that your Supabase project is running and accessible
3. Verify that your IP address is allowed in the Supabase project settings
4. Check the browser console and server logs for any errors

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Netlify Supabase Integration](https://docs.netlify.com/integrations/supabase/)
- [Next.js with Supabase](https://supabase.io/docs/guides/with-nextjs)
