import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProducts } from '@/services/productService';
import styles from './Products.module.css';
import { useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner/LoadingSpinner';
import Pagination from '@/components/Pagination/Pagination';

const ProductList = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  
  // دریافت پارامترهای جستجو از URL
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort');

  const { data: paginatedResponse, isLoading, isError } = useQuery({
    queryKey: ['products', currentPage, category, searchQuery, minPrice, maxPrice, featured, sort],
    queryFn: () => getProducts({
      page: currentPage,
      perPage: 9,
      category: category || undefined,
      search: searchQuery || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      featured: featured ? featured === 'true' : undefined,
      sort: sort || undefined
    }),
    keepPreviousData: true
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className={styles.error}>خطایی در دریافت محصولات رخ داده است</div>;

  return (
    <div className={styles.container}>
      {/* نمایش عنوان دسته‌بندی اگر وجود دارد */}
      {category && (
        <h1 className={styles.categoryTitle}>
          {t('products.category')}: {t(`categories.${category}`)}
        </h1>
      )}
      
      {/* نمایش پیام مناسب وقتی محصولی وجود ندارد */}
      {!paginatedResponse?.data?.length ? (
        <div className={styles.emptyState}>
          {category 
            ? `${t('products.noCategoryProducts')} ${t(`categories.${category}`)}`
            : searchQuery
              ? `${t('products.noSearchResults')} "${searchQuery}"`
              : t('products.noProducts')
          }
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {paginatedResponse.data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {paginatedResponse.total > 9 && (
            <div className={styles.paginationContainer}>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(paginatedResponse.total / 9)}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  // اسکرول به بالا هنگام تغییر صفحه
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;