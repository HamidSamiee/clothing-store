// src/components/FeaturedProducts/FeaturedProducts.tsx
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ProductCard/ProductCard';
import { useTranslation } from 'react-i18next';
import styles from './FeaturedProducts.module.css';
import { Product } from '@/types/Product';
import { getFeaturedProducts } from '@/services/productService';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: getFeaturedProducts,
  });
  console.log('FeaturedProducts',products)

  if (isLoading) return <div className={styles.loading}>{t('loading.message')}...</div>;

  return (
    <section className={styles.featuredProducts}>
      <div className={styles.header}>
        <h2>{t('featuredProducts.title')}</h2>
        <p>{t('featuredProducts.subtitle')}</p>
      </div>

      <div className={styles.productsGrid}>
        {Array.isArray(products) && products?.map((product: Product) => (
          <ProductCard 
            key={product.id} 
            product={
               { 
                ...product, 
                image: product.image,
                id: product.id.toString() 
                }
              } 
            showBadge={true}
          />
        ))}
      </div>

      <div className={styles.ctaContainer}>
        <a href="/products" className={styles.viewAllBtn}>
          {t('featuredProducts.viewAll')}
        </a>
      </div>
    </section>
  );
};

export default FeaturedProducts;