
// src/components/ProductCard/ProductCard.tsx
import { useTranslation } from 'react-i18next';
import styles from './ProductCard.module.css';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { ProductCardProps } from '@/types/Product';
import { toPersianNumbersWithComma } from '@/utils/toPersianNumbers';
import { Link } from 'react-router-dom';



const ProductCard = ({ product, showBadge = false }: ProductCardProps) => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { addToCart } = useCart();

  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <div className={`${styles.productCard} ${darkMode ? styles.dark : ''}`}>
      {showBadge && (
        <div className={styles.featuredBadge}>
          {t('product.featured')}
        </div>
      )}
      
      {product.discount && (
        <div className={styles.discountBadge}>
          {toPersianNumbersWithComma(product.discount)} %
        </div>
      )}
      
      <Link to={`/products/${product.id}`} className={styles.imageContainer}>
        <img 
          src={product.image} 
          alt={product.name} 
          className={styles.productImage}
          loading="lazy"
        />
      </Link>
      
      <div className={styles.productInfo}>
        <span className={styles.category}>{t(`categories.${product.category}`)}</span>
        <h3 className={styles.productName}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        
        <div className={styles.rating}>
          {'★'.repeat(Math.round(product.rating))}
          {'☆'.repeat(5 - Math.round(product.rating))}
          <span>({(Number(product.rating) || 0).toFixed(1)})</span>
        </div>
        
        <div className={styles.priceContainer}>
          {product.discount && (
            <span className={styles.originalPrice}>
              {toPersianNumbersWithComma(product.price)}
            </span>
          )}
          <span className={styles.finalPrice}>
            {toPersianNumbersWithComma(finalPrice)} {t('product.currency')}
          </span>
        </div>
        
        <button 
          className={styles.addToCartBtn}
          onClick={handleAddToCart}
        >
          {t('product.addToCart')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;