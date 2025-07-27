import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
    title: 'با قدرت شروع کن',
    subtitle: 'با محصولات ما، بهترین نسخه‌ی خودت رو بساز',
    ctaText: 'خرید محصولات',
    ctaLink: '/products?sort=most-popular',
    bgColor: '#f9f3f0'
  },
  {
    id: 2,
    image: '/images/hero/slide2.png',
    title: 'ترندهای فصل',
    subtitle: 'محصولات ویژه با استقبال بالا',
    ctaText: 'مشاهده ترندها',
    ctaLink: '/collections/trending',
    bgColor: '#f0f9f3'
  },
  {
    id: 3,
    image: '/images/hero/slide3.png',
    title: 'محصولات پربازدید',
    subtitle: 'برترین انتخاب‌های مشتریان ما',
    ctaText: 'خرید محصولات پرطرفدار',
    ctaLink: '/bestsellers',
    bgColor: '#f3f0f9'
  }
];

const HeroSection = () => {
  const { t } = useTranslation();

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
                {/* <Link
                  to={slide.ctaLink}
                  className={styles.ctaButton}
                >
                  {t(slide.ctaText)}
                </Link> */}
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