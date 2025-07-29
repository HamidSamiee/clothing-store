import { useTranslation } from 'react-i18next';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import styles from './HeroSection.module.css';

const slides = [
  {
    id: 1,
    image: '/images/hero/slide1.png',
    title: 'hero.slide1.title',
    subtitle: 'hero.slide1.subtitle',
    ctaLink: '/products?sort=most-popular',
    bgColor: '#f9f3f0'
  },
  {
    id: 2,
    image: '/images/hero/slide2.png',
    title: 'hero.slide2.title',
    subtitle: 'hero.slide2.subtitle',
    ctaLink: '/collections/trending',
    bgColor: '#f0f9f3'
  },
  {
    id: 3,
    image: '/images/hero/slide3.png',
    title: 'hero.slide3.title',
    subtitle: 'hero.slide3.subtitle',
    ctaLink: '/bestsellers',
    bgColor: '#f3f0f9'
  }
];

const HeroSection = () => {
  const { t } = useTranslation() as { t: (key: string) => string };

  return (
    <section className={styles.hero}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        loop={true}
        navigation={{
          nextEl: `.${styles.swiperButtonNext}`,
          prevEl: `.${styles.swiperButtonPrev}`,
        }}
        pagination={{
          clickable: true,
          el: `.${styles.swiperPagination}`,
        }}
        dir="rtl"
        className={styles.swiperContainer}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className={styles.swiperSlide}>
            <div 
              className={styles.slideContent}
              style={{ backgroundColor: slide.bgColor }}
            >
              <div className={styles.textContent}>
                <h2 className={styles.title}>{t(slide.title)}</h2>
                <p className={styles.subtitle}>{t(slide.subtitle)}</p>
              </div>
              <div className={styles.imageContainer}>
                <img
                  src={slide.image}
                  alt={t(slide.title)}
                  className={styles.slideImage}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* دکمه‌های ناوبری */}
      <div className={`${styles.swiperButton} ${styles.swiperButtonNext}`}>
        <span className={styles.swiperButtonIcon}>&#10095;</span>
      </div>
      <div className={`${styles.swiperButton} ${styles.swiperButtonPrev}`}>
        <span className={styles.swiperButtonIcon}>&#10094;</span>
      </div>

      {/* پاگینشن */}
      <div className={styles.swiperPagination}></div>
    </section>
  );
};

export default HeroSection;