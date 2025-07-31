import { Handler } from '@netlify/functions';
import fs from 'fs';
import path from 'path';

const handler: Handler = async () => {
  const dbPath = path.resolve(__dirname, 'db.json');
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(rawData);

  return {
    statusCode: 200,
    body: JSON.stringify(data.products || []),
  };
};

export { handler };
