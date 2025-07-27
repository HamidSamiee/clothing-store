import { useTranslation } from 'react-i18next';
import styles from './Loading.module.css';

const Loading = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* انیمیشن بارگذاری */}
        <div className={styles.fashionLoader}>
          <div className={styles.hanger}></div>
          <div className={styles.clothes}>
            <div className={styles.shirt}></div>
            <div className={styles.pants}></div>
            <div className={styles.dress}></div>
          </div>
        </div>
        
        {/* متن بارگذاری */}
        <p className={styles.loadingText}>{t('loading.message')}</p>
        
        {/* نوار پیشرفت */}
        <div className={styles.progressBar}>
          <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;