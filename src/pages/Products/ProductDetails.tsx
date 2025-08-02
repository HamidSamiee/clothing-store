import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styles from './ProductDetails.module.css';
import { getProductById } from '@/services/productService';

const ProductDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(Number(id!)) // Convert id to number
  });
console.log('getProductById:',product)
  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.productInfo}>
        <h1 className={styles.productTitle}>{product?.name}</h1>
        <div className={styles.productPrice}>
          {product?.price.toLocaleString()} {t('product.currency')}
        </div>
        <button className={styles.addToCartBtn}>
          {t('product.addToCart')}
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;