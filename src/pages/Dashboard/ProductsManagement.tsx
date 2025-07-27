// pages/Dashboard/ProductsManagement.tsx
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { 
  getProducts,
  deleteProduct,
  searchProducts
} from '@/services/productService';
import ProductModal from './components/ProductModal/ProductModal';
import styles from './AdminComponents.module.css';
import { Product } from '@/types/Product';
import { toast } from 'react-toastify';
import { toPersianNumbers, toPersianNumbersWithComma } from '@/utils/toPersianNumbers';
import { PersianTooltip } from '@/ui/Tooltip/Tooltip';


const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, total } = await getProducts({
        page: pagination.page,
        perPage: pagination.perPage
      });
      setProducts(data);
      setFilteredProducts(data);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchProducts(searchTerm);
      setFilteredProducts(results);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProductId(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (id: number) => {
    setCurrentProductId(id);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await deleteProduct(id);
        toast.info('محصول با موفقیت حذف شد')
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>مدیریت محصولات</h2>
      
      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button 
          className={styles.addButton} 
          onClick={handleAddProduct}
          disabled={isLoading}
        >
          <FiPlus /> افزودن محصول
        </button>
      </div>

      {isLoading && !filteredProducts.length ? (
        <div className={styles.loading}>در حال بارگذاری محصولات...</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نام محصول</th>
                <th>قیمت (تومان)</th>
                <th>موجودی</th>
                <th>ویژه</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{toPersianNumbers(product.id)}</td>
                  <td>{product.name}</td>
                  <td>{toPersianNumbersWithComma(product.price)}</td>
                  <td>{toPersianNumbers(product.stock)}</td>
                  <td>{product.featured ? '✓' : '✗'}</td>
                  <td>
                  
                  <PersianTooltip title="ویرایش" arrow>
                        <button 
                          className={styles.editBtn}
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <FiEdit2 />
                        </button>              
                  </PersianTooltip>
                  <PersianTooltip title="حذف" arrow>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <FiTrash2 />
                        </button>
                  </PersianTooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.total > pagination.perPage && (
            <div className={styles.paginationWrapper}>
              {/* دکمه قبلی */}
              <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <FiChevronRight className={styles.navIcon} /> {/* برای RTL */}
              </button>

              {/* دکمه‌های شماره صفحه */}
              {Array.from(
                { length: Math.ceil(pagination.total / pagination.perPage) },
                (_, i) => i + 1
              ).map(page => (
                <button
                  key={page}
                  className={`${styles.pageButton} ${
                    page === pagination.page ? styles.active : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {toPersianNumbers(page)}
                </button>
              ))}

              {/* دکمه بعدی */}
              <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === Math.ceil(pagination.total / pagination.perPage)}
              >
                <FiChevronLeft className={styles.navIcon} /> {/* برای RTL */}
              </button>
            </div>
          )}
                  </>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={currentProductId}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default ProductsManagement;