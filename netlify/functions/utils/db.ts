import { Pool, QueryResult, QueryResultRow, QueryConfig } from 'pg';

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// تابع تست اتصال با تایپ‌بندی صحیح
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connection to database established successfully');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Failed to connect to database:', err.message);
    }
    throw err;
  }
};

testDatabaseConnection().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('Database connection test failed:', err.message);
  }
});

// Event handlers با تایپ‌بندی صحیح
pool.on('connect', () => {
  console.log('🔵 New client connected to the pool');
});

pool.on('error', (err: Error) => {
  console.error('🔴 Unexpected error on idle client', err.message);
});

pool.on('remove', () => {
  console.log('🟡 Client removed from the pool');
});

export const query = async <T extends QueryResultRow>(
  text: string | QueryConfig,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> => {
  try {
    const start = Date.now();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    console.log(`⚡ Executed query in ${duration}ms:`, {
      query: typeof text === 'string' ? text : text.text,
      params: params || null,
      rows: result.rowCount
    });
    
    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Query failed:', {
      query: typeof text === 'string' ? text : text.text,
      params: params || null,
      error: errorMessage
    });
    throw err;
  }
};

export const getClient = async () => {
  try {
    const client = await pool.connect();
    console.log('🔵 Acquired client from pool');
    
    const originalQuery = client.query;
    
    const wrappedQuery: typeof client.query = ((...args: Parameters<typeof originalQuery>) => {
      const queryText = typeof args[0] === 'string' 
        ? args[0] 
        : (args[0] as QueryConfig).text || `PREPARED: ${(args[0] as QueryConfig).name || 'unknown'}`;
      
      console.log('⚡ Client executing query:', queryText);
      return originalQuery.apply(client, args);
    }) as typeof client.query;
    
    client.query = wrappedQuery;
    
    return client;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Failed to get client from pool:', err.message);
    }
    throw err;
  }
};