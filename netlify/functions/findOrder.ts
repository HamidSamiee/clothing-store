import { Handler } from '@netlify/functions';
import { getClient } from './db';

export const handler: Handler = async (event) => {
  const { authority } = event.queryStringParameters || {};
  
  if (!authority) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Authority parameter is required' })
    };
  }

  const client = await getClient();
  
  try {
    const result = await client.query(
      `SELECT o.* FROM orders o
       JOIN order_meta om ON o.id = om.order_id
       WHERE om.meta_key = 'authority' AND om.meta_value = $1
       LIMIT 1`,
      [authority]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Order not found' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  } catch (err) {
    console.error('Find order error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطای سرور در یافتن سفارش',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  } finally {
    await client.release();
  }
};