import React from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import styles from './Pagination.module.css';
import { toPersianNumbers } from '@/utils/toPersianNumbers';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${styles.button} ${styles.navButton} ${
          currentPage === 1 ? styles.disabledButton : ''
        }`}
        aria-label="صفحه قبلی"
      >
        <FiChevronLeft size={18} />
      </button>

      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${styles.button} ${styles.pageButton} ${
            currentPage === page ? styles.activePage : ''
          }`}
        >
          {toPersianNumbers(page)}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${styles.button} ${styles.navButton} ${
          currentPage === totalPages ? styles.disabledButton : ''
        }`}
        aria-label="صفحه بعدی"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;