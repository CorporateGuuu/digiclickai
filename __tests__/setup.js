// Global test setup
const { Pool } = require('pg');

// Create a test database connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store_test',
  ssl: false,
});

// Setup function to run before tests
async function setupTestDatabase() {
  try {
    // Create test database if it doesn't exist
    const client = await pool.connect();
    
    try {
      // Check if test database exists
      const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'phone_electronics_store_test'"
      );
      
      if (result.rows.length === 0) {
        // Disconnect from default database
        client.release();
        
        // Connect to postgres database to create test database
        const pgClient = new Pool({
          connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
          ssl: false,
        });
        
        const pgClientConn = await pgClient.connect();
        await pgClientConn.query('CREATE DATABASE phone_electronics_store_test');
        pgClientConn.release();
        await pgClient.end();
        
        // Reconnect to test database
        const testClient = await pool.connect();
        
        // Import schema from main database
        await testClient.query(`
          CREATE EXTENSION IF NOT EXISTS dblink;
          
          SELECT dblink_exec(
            'dbname=phone_electronics_store',
            'SELECT pg_catalog.pg_export_snapshot()'
          );
          
          CREATE SCHEMA IF NOT EXISTS public;
        `);
        
        testClient.release();
      } else {
        // Clean up test database
        await client.query('DELETE FROM cart_items');
        await client.query('DELETE FROM carts');
        await client.query('DELETE FROM order_items');
        await client.query('DELETE FROM orders');
        await client.query('DELETE FROM product_specifications');
        await client.query('DELETE FROM products');
        await client.query('DELETE FROM categories');
        await client.query('DELETE FROM user_addresses');
        await client.query('DELETE FROM users WHERE email != \'admin@example.com\'');
      }
    } finally {
      client.release();
    }
    
    // // // console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

// Teardown function to run after tests
async function teardownTestDatabase() {
  await pool.end();
  // // // console.log('Test database connection closed');
}

// Export setup and teardown functions
module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  pool
};
