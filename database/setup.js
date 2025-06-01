const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const dbName = 'phone_electronics_store';

async function setupDatabase() {
  // // // console.log('Setting up the database...');

  // Connect to PostgreSQL server
  const pool = new Pool({
    connectionString,
  });

  try {
    // Check if database exists
    const dbCheckResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rowCount === 0) {
      // // // console.log(`Creating database: ${dbName}`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      // // // console.log(`Database ${dbName} created successfully`);
    } else {
      // // // console.log(`Database ${dbName} already exists`);
    }

    // Close connection to postgres database
    await pool.end();

    // Connect to the newly created database
    const dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`,
    });

    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL
    // // // console.log('Creating database schema...');
    await dbPool.query(schemaSql);
    // // // console.log('Database schema created successfully');

    // Close connection
    await dbPool.end();

    // // // console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Function to import CSV data into the database
async function importCsvData(csvFilePath, tableName, columnMapping) {
  // // // console.log(`Importing data from ${csvFilePath} into ${tableName}...`);

  // Connect to the database
  const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`,
  });

  try {
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      return;
    }

    // Read CSV file
    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    // Read header line
    const headerLine = await new Promise(resolve => {
      rl.once('line', line => resolve(line));
    });

    // Parse header columns
    const headers = headerLine.split(',').map(header => header.trim());

    // Map CSV columns to database columns
    const dbColumns = headers.map(header => columnMapping[header] || null)
      .filter(column => column !== null);

    // Begin transaction
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Process each line
      let lineCount = 0;
      for await (const line of rl) {
        if (lineCount === 0) {
          lineCount++;
          continue; // Skip header line
        }

        // Parse CSV line
        const values = parseCsvLine(line);

        // Map values to database columns
        const dbValues = [];
        const placeholders = [];
        let paramIndex = 1;

        headers.forEach((header, index) => {
          const dbColumn = columnMapping[header];
          if (dbColumn && index < values.length) {
            dbValues.push(values[index]);
            placeholders.push(`$${paramIndex++}`);
          }
        });

        // Insert into database
        const query = `
          INSERT INTO ${tableName} (${dbColumns.join(', ')})
          VALUES (${placeholders.join(', ')})
        `;

        await client.query(query, dbValues);
        lineCount++;
      }

      // Commit transaction
      await client.query('COMMIT');
      // // // console.log(`Imported ${lineCount - 1} records into ${tableName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error importing data from ${csvFilePath}:`, error);
  } finally {
    await dbPool.end();
  }
}

// Helper function to parse CSV line (handles quoted values and escaped characters)
function parseCsvLine(line) {
  // Handle empty lines
  if (!line || line.trim() === '') {
    return [];
  }

  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    // Handle quoted fields
    if (char === '"') {
      if (inQuotes) {
        // Check for escaped quotes (double quotes)
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2; // Skip both quote characters
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        // Start of quoted field
        inQuotes = true;
        i++;
        continue;
      }
    }

    // Handle field separators
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      i++;
      continue;
    }

    // Handle normal characters
    current += char;
    i++;
  }

  // Add the last field
  result.push(current);

  // Trim whitespace from all fields
  return result.map(field => field.trim());
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = {
  setupDatabase,
  importCsvData
};
