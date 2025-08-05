// components/user/OrderHistory.tsx
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/services/orderService';
import { Order } from '@/types/Order';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/ui/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../Products/components/ErrorMessage/ErrorMessage';
import { toPersianNumbers, toPersianNumbersWithComma } from '@/utils/toPersianNumbers';
import styles from './UserProfile.module.css';
import { getProductsByIds } from '@/services/orderService';
import { Product } from '@/types/Product';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const OrderHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); 
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => user ? getOrders({ userId: Number(user.id) }) : Promise.resolve({ data: [], total: 0 }),
  });

  const orders = useMemo(() => data?.data || [], [data]);

  const statusStyles: Record<Order['status'], string> = {
    delivered: styles.delivered,
    shipped: styles.shipping,
    processing: styles.processing,
    cancelled: styles.cancelled,
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = Array.from(new Set(
        orders.flatMap(order => order.items.map(item => item.productId))
      ));
  
      if (productIds.length > 0) {
        const products = await getProductsByIds(productIds);
        const map: Record<number, Product> = {};
        products.forEach(p => {
          map[Number(p.id)] = p;
        });
        setProductsMap(map);
      }
    };
  
    if (orders.length > 0) {
      fetchProducts();
    }
  }, [orders]);
  
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={t('order.fetchError')} />;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('order.history')}</h2>

      {orders.length === 0 ? (
        <div className={styles.loading}>{t('order.noOrders')}</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('order.orderNumber')}</th>
                <th>{t('order.date')}</th>
                <th>{t('order.total')}</th>
                <th>{t('order.label')}</th>
                <th>{t('order.items')}</th>
                <th>{t('order.paymentMethod')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{toPersianNumbers(order.id)}</td>
                  <td>{toPersianNumbers(new Date(order.date).toLocaleDateString('fa-IR'))}</td>
                  <td>{toPersianNumbersWithComma(order.total)} {t('currency')}</td>
                  <td>
                    <span className={`${styles.status} ${statusStyles[order.status]}`}>
                      {t(`order.status.${order.status}`)}
                    </span>
                  </td>
                  <td>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          <span style={{ display: 'block' }}>
                            {productsMap[item.productId]?.name} 
                          </span>
                          <span style={{ display: 'block' }}>
                            {t('order.quantity')}: {toPersianNumbers(item.quantity)}
                          </span>
                          <span style={{ display: 'block' }}>
                            {toPersianNumbersWithComma(item.price * item.quantity)} {t('currency')}
                          </span>
                        </li>

                      ))}
                    </ul>
                  </td>
                  <td>{order.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
