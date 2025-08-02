import { getClient } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Order, OrderItem, OrderStatus } from '@/types/Order';

interface CreateOrderRequest {
  userId: number;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
}

const handler: Handler = async (event) => {
  const client = await getClient();
  try {
    const { userId, items, total, paymentMethod, shippingAddress } = 
      JSON.parse(event.body || '{}') as CreateOrderRequest;
    
    await client.query('BEGIN');
    
    const orderResult = await client.query<{ id: number; created_at: string }>(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [userId, total, 'processing' as OrderStatus, paymentMethod, shippingAddress]
    );
    
    const orderId = orderResult.rows[0].id;
    const createdAt = orderResult.rows[0].created_at;
    
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );
      
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }
    
    await client.query(
      'INSERT INTO user_orders (user_id, order_id) VALUES ($1, $2)',
      [userId, orderId]
    );
    
    await client.query('COMMIT');
    
    const response: Order = {
      id: orderId,
      userId,
      date: createdAt,
      items,
      total,
      status: 'processing',
      paymentMethod,
      shippingAddress
    };
    
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  } finally {
    client.release();
  }
};

export { handler };