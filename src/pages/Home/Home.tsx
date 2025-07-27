// import { useTranslation } from 'react-i18next';
import HeroSection from '@/components/HeroSection/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts';
import styles from './Home.module.css';
import { useTheme } from '@/hooks/useTheme';
import Marquee from '@/components/HeroSlider/Marquee';


const Home = () => {
  // const { t } = useTranslation();
  const { darkMode } = useTheme();
  return (
    <div className={styles.homePage}>
      <section className={styles.heroSection}>
        <HeroSection />
      </section>
      
      <section className={`${styles.featuredSection} ${darkMode ? styles.dark : ''}`}>
        <Marquee />
        <FeaturedProducts />
      </section>
    </div>
  );
};

export default Home;