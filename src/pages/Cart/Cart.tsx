// src/components/Cart/Cart.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import CartItem from '@/components/CartItem/CartItem';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Modal from '@/ui/Modal/Modal';
import LoginForm from '@/components/LoginForm/LoginForm';
import { toPersianNumbersWithComma } from '@/utils/toPersianNumbers';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total, removeFromCart, updateQuantity, clearCart, getUniqueKey } = useCart();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate('/checkout');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    navigate('/checkout');
  };

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>{t('cart.title')}</h1>
      
      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          {t('cart.empty') + ' '}
          <Link to="/products" className={styles.continueShopping}>
            {t('cart.continueShopping')}
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {items.map((item) => {
              const uniqueKey = getUniqueKey(item);
              return (
                <CartItem
                  key={uniqueKey}
                  item={item}
                  onRemove={() => removeFromCart(uniqueKey)}
                  onQuantityChange={(quantity) => updateQuantity(uniqueKey, quantity)}
                />
              );
            })}
          </div>
          
          <div className={styles.cartSummary}>
            <div className={styles.total}>
              <span>{t('cart.total')}:</span>
              <span>{toPersianNumbersWithComma(total)} {t('product.currency')}</span>
            </div>
            
            <div className={styles.actions}>
              <button
                className={styles.clearCart}
                onClick={clearCart}
              >
                {t('cart.clearCart')}
              </button>
              
              <button
                className={styles.checkoutButton}
                onClick={handleCheckout}
              >
                {t('cart.checkout')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal برای کاربران لاگین نکرده */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={t('auth.loginRequired')}
      >
        <div className={styles.loginModalContent}>
          <p>{t('cart.loginToCheckout')}</p>
          <LoginForm
            onSuccess={handleLoginSuccess}
            showCloseButton={true}
            onClose={() => setShowLoginModal(false)}
          />
          <div className={styles.modalFooter}>
            <p>
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" onClick={() => setShowLoginModal(false)}>
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
