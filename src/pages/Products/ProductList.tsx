import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProducts } from '@/services/productService';
import styles from './Products.module.css';
import { useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner/LoadingSpinner';
import Pagination from '@/components/Pagination/Pagination';
import { Product, ProductSortOption, PaginatedResponse } from '@/types/Product';

type CategoryKey = "ورزشی" | "زنانه" | "مردانه" | "بچه گانه" | "اکسسوری" |"men" | "women" | "kids" | "sport" | "shoes" | "accessories" ;

// بررسی معتبر بودن دسته‌بندی
const isValidCategory = (cat: string | null): cat is CategoryKey => {
  return (
    cat !== null &&
    ["ورزشی", "زنانه", "مردانه", "بچه گانه", "اکسسوری","men" , "women" , "kids" , "sport" , "shoes" , "accessories"].includes(cat)
  );
};

const ProductList = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort') as ProductSortOption | null;

  const translateCategory = (cat: CategoryKey): string => {
    return t(`categories.${cat}`, { defaultValue: cat });
  };

  const {
    data: paginatedResponse,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', currentPage, category, searchQuery, minPrice, maxPrice, featured, sort],
    queryFn: () =>
      getProducts({
        page: currentPage,
        perPage: 9,
        category: category || undefined,
        search: searchQuery || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        featured: featured ? featured === 'true' : undefined,
        sort: sort || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className={styles.error}>{t('products.error')}</div>;

  return (
    <div className={styles.container}>
      {category && (
        <h1 className={styles.categoryTitle}>
          {t('products.category')}:{' '}
          {isValidCategory(category) ? translateCategory(category) : category}
        </h1>
      )}

      {!paginatedResponse?.data?.length ? (
        <div className={styles.emptyState}>
          {category
            ? `${t('products.noCategoryProducts')} ${
                isValidCategory(category) ? translateCategory(category) : category
              }`
            : searchQuery
            ? `${t('products.noSearchResults')} "${searchQuery}"`
            : t('products.noProducts')}
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {paginatedResponse.data.map((product: Product) => (
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
