// src/pages/SearchPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '@/services/productService';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/Product';
import styles from './SearchPage.module.css';
import LoadingSpinner from '@/ui/LoadingSpinner/LoadingSpinner';
import ProductCard from '@/components/ProductCard/ProductCard';
import Pagination from '@/components/Pagination/Pagination';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults(query, currentPage);
    } else {
      navigate('/');
    }
  }, [query, currentPage]);

  const fetchSearchResults = async (searchQuery: string, page: number) => {
    try {
      setLoading(true);
      const { data, total } = await getProducts({
        search: searchQuery,
        page: page,
        perPage: 8
      });
      setProducts(data);
      setTotalProducts(total);
      setError('');
      
      // اسکرول به نتایج بدون پرش
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 50);
    } catch (err) {
      setError(t('search.error'));
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // اضافه کردن query به URL بدون ریلود صفحه
    navigate(`?q=${encodeURIComponent(query)}&page=${page}`, { replace: true });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.searchPage} ref={resultsRef}>
      <h1 className={styles.title}>
        {t('search.resultsFor')} "{query}"
      </h1>
      
      {products.length === 0 ? (
        <div className={styles.noResults}>
          {t('search.noResults')} "{query}"
        </div>
      ) : (
        <>
          <div className={styles.resultsGrid}>
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
          
          {totalProducts > 9 && (
            <div className={styles.paginationContainer}>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalProducts / 9)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;