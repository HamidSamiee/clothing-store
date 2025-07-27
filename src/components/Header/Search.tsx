import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { getProducts } from '@/services/productService';
import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.css';
import { Product } from '@/types/Product';

interface SearchProps {
  isMobile?: boolean;
}

const Search = ({ isMobile = false }: SearchProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    try {
      const { data } = await getProducts({
        search: query,
        perPage: 5
      });
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error(t('header.searchError'), error);
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div 
      className={`${styles.searchContainer} ${isMobile ? styles.mobileSearchContainer : ''}`} 
      ref={searchRef}
    >
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={t('header.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
        />
        <button 
          type="submit" 
          className={styles.searchButton} 
          aria-label={t('header.search')}
        >
          <FaSearch />
        </button>
        
        {showResults && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map(product => (
              <div 
                key={product.id}
                className={styles.searchItem}
                onClick={() => {
                  navigate(`/products/${product.id}`);
                  setShowResults(false);
                }}
              >
                <span className={styles.searchItemName}>{product.name}</span>
                <span className={styles.searchItemPrice}>
                  {product.price.toLocaleString()} {t('common.currency')}
                </span>
              </div>
            ))}
            <div 
              className={styles.seeAllResults}
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                setShowResults(false);
              }}
            >
              {t('header.viewAllResults')}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Search;