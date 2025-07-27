import styles from './Products.module.css';
import ProductList from './ProductList';

const Products = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>محصولات</h1>     
      <div className={styles.productsGrid}>     
        <ProductList />   
      </div>
    </div>
  );
};

export default Products;