import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@pages/NotFound/NotFound.module.css';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>{t('notFound.title')}</h1>
        <p className={styles.errorMessage}>{t('notFound.message')}</p>
        
        <div className={styles.animationContainer}>
          <div className={styles.clothesHanger}></div>
          <div className={styles.shirt}></div>
          <div className={styles.pants}></div>
        </div>

        <Link to="/" className={styles.homeLink}>
          {t('notFound.backToHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;