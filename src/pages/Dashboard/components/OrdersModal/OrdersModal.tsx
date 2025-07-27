
import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { Order, OrderItem } from '@/types/Order';
import { Product } from '@/types/Product';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import styles from '../../AdminComponents.module.css';
import { getProductsForOrder } from '@/services/orderService';
import useClickOutside from '@/hooks/useClickOutside';

interface OrdersModalProps {
  order: Order;
  onClose: () => void;
}

const OrdersModal = ({ order, onClose }: OrdersModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productsData = await getProductsForOrder(order.id);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [order.id]);

    const getProductName = (productId: number): string => {
        // تبدیل productId به string چون در داده‌های شما id محصولات رشته هستند
        const product = products.find(p => p.id.toString() === productId.toString());
        // console.log(`جستجو برای محصول ${productId}:`, product); // برای دیباگ
        return product ? product.name : `محصول #${productId}`;
    };

    const modalRef = useRef<HTMLDivElement>(null);
    
    // استفاده از هوک سفارشی برای تشخیص کلیک خارج از مودال
 useClickOutside(modalRef, onClose);

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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3>جزئیات سفارش #{toPersianNumbers(order.id)}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <span>وضعیت:</span>
            <span className={`${styles.status} ${statusClasses[order.status]}`}>
              {statusTranslations[order.status]}
            </span>
          </div>
          
          <div className={styles.detailRow}>
            <span>کاربر:</span>
            <span>{toPersianNumbers(order.userId)}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>تاریخ سفارش:</span>
            <span>{new Date(order.date).toLocaleDateString('fa-IR')}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>مبلغ کل:</span>
            <span>{toPersianNumbers(order.total.toLocaleString())} تومان</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>روش پرداخت:</span>
            <span>{order.paymentMethod}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>آدرس ارسال:</span>
            <span>{order.shippingAddress || 'آدرس ثبت نشده'}</span>
          </div>
          
          <h4 className={styles.itemsTitle}>محصولات سفارش:</h4>
          <div className={styles.itemsList}>
            {order.items.map(item => (
              <div key={item.productId} className={styles.itemDetail}>
                <div className={styles.itemInfo}>
                  <span>محصول #{toPersianNumbers(item.productId)}</span>
                  <span className={styles.productName}>
                        {isLoadingProducts ? 'در حال بارگذاری...' : getProductName(item.productId)}
                  </span>
                  <span>{toPersianNumbers(item.quantity)} عدد</span>
                  <span>{toPersianNumbers(item.price.toLocaleString())} تومان</span>
                </div>
                <div className={styles.itemTotal}>
                  جمع: {toPersianNumbers((item.price * item.quantity).toLocaleString())} تومان
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.closeModalBtn} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;