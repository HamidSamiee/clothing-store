import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = async <T extends QueryResultRow>(
  text: string, 
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> => {
  return await pool.query<T>(text, params);
};

export const getClient = async () => {
  return await pool.connect();
};