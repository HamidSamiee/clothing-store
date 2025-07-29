// src/components/RelatedProducts/RelatedProducts.tsx
import { useEffect, useState } from 'react';
import styles from './RelatedProducts.module.css';
import ProductCard from '@/components/ProductCard/ProductCard';
import http from '@/services/httpService';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Product } from '@/types/Product';

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

const RelatedProducts = ({ category, currentProductId }: RelatedProductsProps) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await http.get(`/products?category=${category}&limit=6`);
        const filteredProducts = response.data.filter(
          (product: Product) => product.id !== currentProductId
        );
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId]);

  const handleAddToCart = (product: Product) => {
    // پیاده‌سازی منطق افزودن به سبد خرید
    console.log('Product added to cart:', product);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.relatedProducts}>
      <h2 className={styles.title}>{t('product.relatedProducts')}</h2>
      
      {loading ? (
        <div className={styles.loading}>{t('product.loading')}</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={4}
          navigation
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 15
            }
          }}
          className={styles.swiperContainer}
        >
          {products.map(product => (
            <SwiperSlide key={product.id} className={styles.slide} >
              <ProductCard 
                product={product} 
                onAddToCart={() => handleAddToCart(product)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default RelatedProducts;