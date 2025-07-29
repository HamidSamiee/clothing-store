import React from 'react';
import styles from './About.module.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { toPersianNumbers } from '@/utils/toPersianNumbers';

interface HistoryItem {
  id: number;
  title: string;
  text: string;
  date: string;
}

const About: React.FC = () => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const historyItems: HistoryItem[] = [
    {
      id: 1,
      title: t('about.historyTitle1'),
      text: t('about.historyText1'),
      date: t('about.historyDate1')
    },
    {
      id: 2,
      title: t('about.historyTitle2'),
      text: t('about.historyText2'),
      date: t('about.historyDate2')
    },
    {
      id: 3,
      title: t('about.historyTitle3'),
      text: t('about.historyText3'),
      date: t('about.historyDate3')
    }
  ];

  return (
    <div className={`${styles.aboutContainer} ${darkMode ? styles.dark : ''}`}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Mission/Vision */}
      <section className={styles.missionSection}>
        <div className={styles.missionCard}>
          <div className={styles.iconBox}>
            <i className="fas fa-heart"></i>
          </div>
          <h2>{t('about.mission')}</h2>
          <p>{t('about.missionText')}</p>
        </div>
        
        <div className={styles.missionCard}>
          <div className={styles.iconBox}>
            <i className="fas fa-star"></i>
          </div>
          <h2>{t('about.vision')}</h2>
          <p>{t('about.visionText')}</p>
        </div>
      </section>

      {/* History */}
      <section className={styles.historySection}>
        <h2 className={styles.sectionTitle}>{t('about.history')}</h2>
        <div className={styles.timeline}>
          {historyItems.map((item) => (
            <div key={item.id} className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3>{item.title}</h3>
                <p>{toPersianNumbers(item.text)}</p>
                <span className={styles.timelineDate}>{toPersianNumbers(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;