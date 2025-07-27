// src/pages/Profile/OrderHistory.tsx
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/orderService';

const OrderHistory = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  return (
    <div>
      <h2>تاریخچه سفارشات</h2>
      {isLoading ? (
        <p>در حال بارگذاری...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>شماره سفارش</th>
              <th>تاریخ</th>
              <th>مبلغ</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{new Date(order.date).toLocaleDateString('fa-IR')}</td>
                <td>{order.total.toLocaleString('fa-IR')} تومان</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};