import { Handler } from '@netlify/functions';
import { getClient } from './db';

export const handler: Handler = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'بدون داده' })
        };
    }

    const client = await getClient();
    
    try {
        const { 
            userId, 
            items, 
            total, 
            paymentMethod, 
            shippingAddress,
            authority 
        } = JSON.parse(event.body);

        // اعتبارسنجی داده‌های ورودی
        if (userId === null || userId === undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
            };
        }

        if (total === null || total === undefined || isNaN(Number(total))) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'مبلغ کل الزامی است' })
            };
        }

        if (!paymentMethod) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'روش پرداخت الزامی است' })
            };
        }

        await client.query('BEGIN');

        // ثبت سفارش جدید با وضعیت "pending" (به جای "processing")
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                Number(userId),
                Number(total),
                'pending', // <- تغییر وضعیت به "pending"
                paymentMethod,
                shippingAddress || null
            ]
        );

        const orderId = orderResult.rows[0].id;

        // ثبت متادیتای authority (اگر وجود دارد)
        if (authority) {
            await client.query(
                `INSERT INTO order_meta (order_id, meta_key, meta_value)
                 VALUES ($1, 'authority', $2)`,
                [orderId, authority]
            );
        }

        // ثبت آیتم‌های سفارش
        if (Array.isArray(items)) {
            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        orderId,
                        Number(item.productId),
                        Number(item.quantity),
                        Number(item.price)
                    ]
                );
            }
        }

        await client.query('COMMIT');

        return {
            statusCode: 201,
            body: JSON.stringify({
                success: true,
                orderId,
                total,
                status: 'pending' // <- وضعیت برگشتی هم "pending" است
            })
        };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create order error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'خطای سرور در ایجاد سفارش',
                error: err instanceof Error ? err.message : 'Unknown error'
            })
        };
    } finally {
        await client.release();
    }
};