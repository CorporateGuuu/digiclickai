// Database configuration for PostgreSQL

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Environment variables should be used in production
const isProduction = process.env.NODE_ENV === 'production';

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store';

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Connection error handling
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Log error to file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'db-errors.log');
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - Database Error: ${err.message}\n${err.stack}\n\n`;

  fs.appendFile(logFile, logMessage, (appendErr) => {
    if (appendErr) {
      console.error('Error writing to log file:', appendErr);
    }
  });
});

// Test the connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    // // // console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Export the database interface
module.exports = {
  // Simple query method
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Query error:', err.message);
      console.error('Query:', text);
      console.error('Parameters:', params);
      throw err;
    }
  },

  // Get a client with transaction support
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      // Clear the timeout
      clearTimeout(timeout);
      // Set the methods back to their old implementation
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  },

  // Test the database connection
  testConnection,

  // Get the pool for direct access if needed
  pool
};
