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

        // اعتبارسنجی پیشرفته داده‌های ورودی
        if (!userId || isNaN(Number(userId))) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'شناسه کاربر معتبر الزامی است' })
            };
        }

        if (!total || isNaN(Number(total)) || Number(total) <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'مبلغ کل معتبر الزامی است' })
            };
        }

        if (!paymentMethod || !['zarinpal', 'credit', 'cash'].includes(paymentMethod)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'روش پرداخت معتبر الزامی است' })
            };
        }

        await client.query('BEGIN');

        // بررسی سفارش تکراری بر اساس authority
        if (authority) {
            const existingOrder = await client.query(
                `SELECT o.id FROM orders o
                 JOIN order_meta om ON o.id = om.order_id
                 WHERE om.meta_key = 'authority' AND om.meta_value = $1
                 AND o.status = 'pending'
                 LIMIT 1`,
                [authority]
            );

            if (existingOrder.rows.length > 0) {
                await client.query('ROLLBACK');
                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        success: true,
                        orderId: existingOrder.rows[0].id,
                        total: total,
                        status: 'pending',
                        message: 'سفارش قبلاً با این کد پرداخت ثبت شده است'
                    })
                };
            }
        }

        // ثبت سفارش جدید با وضعیت pending
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
             VALUES ($1, $2, 'pending', $3, $4)
             RETURNING id`,
            [
                Number(userId),
                Math.round(Number(total)), // تبدیل به عدد صحیح
                paymentMethod,
                shippingAddress || null
            ]
        );

        const orderId = orderResult.rows[0].id;

        // ثبت متادیتای authority اگر وجود دارد
        if (authority) {
            await client.query(
                `INSERT INTO order_meta (order_id, meta_key, meta_value)
                 VALUES ($1, 'authority', $2)`,
                [orderId, authority]
            );
        }

        // ثبت آیتم‌های سفارش با اعتبارسنجی
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (!item.productId || !item.quantity || !item.price) {
                    await client.query('ROLLBACK');
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ message: 'اطلاعات محصولات ناقص است' })
                    };
                }

                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        orderId,
                        Number(item.productId),
                        Number(item.quantity),
                        Math.round(Number(item.price)) // تبدیل به عدد صحیح
                    ]
                );
            }
        } else {
            await client.query('ROLLBACK');
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'لیست محصولات نمی‌تواند خالی باشد' })
            };
        }

        await client.query('COMMIT');

        return {
            statusCode: 201,
            body: JSON.stringify({
                success: true,
                orderId: orderId,
                total: Math.round(Number(total)), // برگشت مقدار صحیح
                status: 'pending',
                message: 'سفارش با موفقیت ثبت شد'
            })
        };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('خطا در ایجاد سفارش:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                message: 'خطای سرور در ایجاد سفارش',
                error: err instanceof Error ? err.message : 'خطای ناشناخته'
            })
        };
    } finally {
        await client.release();
    }
};