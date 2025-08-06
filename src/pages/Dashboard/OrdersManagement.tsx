// components/admin/OrdersManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiTruck, FiCheck, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import OrdersModal from './components/OrdersModal/OrdersModal';
import styles from './AdminComponents.module.css';
import { Order, OrderStatus } from '@/types/Order';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { getOrders, getProductsByIds, updateOrderStatus } from '@/services/orderService';
import { Product } from '@/types/Product';
import { toast } from 'react-toastify';

const ORDERS_PER_PAGE = 2;

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});


  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrders({
        page: currentPage,
        perPage: ORDERS_PER_PAGE,
        search: searchTerm
      });
      
      const ordersData = Array.isArray(response?.data) ? response.data : [];
      setOrders(ordersData);
      
      const allProductIds = ordersData.flatMap(order => 
        Array.isArray(order?.items) ? 
          order.items.map(item => item?.productId).filter(Boolean) : 
          []
      );
      
      if (allProductIds.length > 0) {
        const fetchedProducts = await getProductsByIds(allProductIds);
        const productsRecord: Record<number, Product> = {};
        fetchedProducts.forEach(p => {
          if (p?.id) {
            productsRecord[Number(p.id)] = p;
          }
        });
        setProductsMap(productsRecord);
      }
      
      setTotalOrders(response?.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در دریافت سفارشات');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage,fetchOrders]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrder.id 
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      
      toast.success(`وضعیت سفارش به "${statusTranslations[newStatus]}" تغییر یافت`);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'خطا در تغییر وضعیت سفارش'
      );
    }
  };

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

const filteredOrders = (orders || []).filter(order => {
  const safeId = order?.id?.toString() || '';
  const safeUserId = order?.userId?.toString() || '';
  const safeStatus = order?.status || '';
  
  return (
    safeId.includes(searchTerm) ||
    safeUserId.includes(searchTerm) ||
    safeStatus.includes(searchTerm)
  );
});

  const statusClasses = {
    'delivered': styles.delivered,
    'shipped': styles.shipping,
    'processing': styles.processing,
    'cancelled': styles.cancelled
  };

  const statusTranslations = {
    'delivered': 'تحویل شده',
    'shipped': 'در حال ارسال',
    'processing': 'در حال پردازش',
    'cancelled': 'لغو شده'
  };

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>مدیریت سفارشات</h2>
      
      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجوی سفارش (شناسه، کاربر، وضعیت)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>در حال بارگذاری سفارشات...</div>
      ) : (
        <>
         <div className={styles.ordersGrid}>
            {filteredOrders?.map(order => (
              <div key={order?.id || Math.random()} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span>سفارش #{toPersianNumbers(order.id)}</span>
                  <span className={`${styles.status} ${statusClasses[order.status]}`}>
                    {statusTranslations[order.status]}
                  </span>
                </div>
                
                <div className={styles.orderBody}>
                  <p>کاربر: {toPersianNumbers(order.userId)}</p>
                  <p>تاریخ: {new Date(order.date).toLocaleDateString('fa-IR')}</p>
                  <p>مبلغ: {toPersianNumbers(order.total.toLocaleString())} تومان</p>
                  <p>روش پرداخت: {order.paymentMethod}</p>
                </div>
                
                <div className={styles.orderItems}>
                    <h4>محصولات:</h4>
                    {order?.items?.map(item => (
                      <div key={item?.productId || Math.random()} className={styles.orderItem}>
                        <span>
                          {item?.productId ? 
                            (productsMap[item.productId]?.name || `محصول #${toPersianNumbers(item.productId)}`) :
                            'محصول ناشناخته'
                          }
                        </span>
                        <span>{toPersianNumbers(item?.quantity || 0)} عدد</span>
                        <span>{toPersianNumbers((item?.price || 0).toLocaleString())} تومان</span>
                      </div>
                    ))}
                  </div>
                
                <div className={styles.orderActions}>
                  <button 
                    className={styles.detailsBtn}
                    onClick={() => handleShowDetails(order)}
                  >
                    <FiEye /> جزئیات
                  </button>
                  
                  {order.status === 'shipped' && (
                    <button 
                      className={styles.trackBtn}
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    >
                      <FiCheck /> تحویل شد
                    </button>
                  )}
                  
                  {order.status === 'processing' && (
                    <button 
                      className={styles.shipBtn}
                      onClick={() => handleStatusChange(order.id, 'shipped')}
                    >
                      <FiTruck /> ارسال شد
                    </button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button 
                      className={styles.cancelBtn}
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      <FiX /> لغو سفارش
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>  

          {selectedOrder && (
            <OrdersModal 
              order={selectedOrder} 
              onClose={closeModal} 
            />
          )}

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronRight />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {toPersianNumbers(page)}
                </button>
              ))}

              <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FiChevronLeft />
              </button>
            </div>
          )}      
        </>
      )}
    </div>
  );
};

export default OrdersManagement;