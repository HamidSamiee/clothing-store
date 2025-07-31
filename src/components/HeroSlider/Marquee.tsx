import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Marquee.module.css';
import { useTranslation } from 'react-i18next';

const Marquee = () => {

  const { t } = useTranslation()  as { t: (key: string) => string };
  const navigate = useNavigate();
  
  const items = [
    {
      id: 1,
      image: '/images/marquee/men.png',
      title: 'آقایان',
      category: 'men'
    },
    {
      id: 2,
      image: '/images/marquee/women.png',
      title: 'بانوان',
      category: 'women'
    },
    {
      id: 3,
      image: '/images/marquee/child.png',
      title: 'کودکان',
      category: 'kids'
    },
    {
      id: 4,
      image: '/images/marquee/sport.png',
      title: 'ورزشی',
      category: 'sport'
    },
    {
      id: 5,
      image: '/images/marquee/shoes.png',
      title: 'کفش',
      category: 'shoes'
    },
    {
      id: 6,
      image: '/images/marquee/accessories.png',
      title: 'اکسسوری',
      category: 'accessories'
    }
  ];

  const handleItemClick = (category: string) => {
    navigate(`/products?category=${category}`);
  };

  return (
    <>
        <h2 className={styles.title}>{t('home.categoryProducts')}</h2>
        <div className={styles.carousel}>
          {Array.isArray(items) && items.map((item, index) => (
            <article 
              key={item.id} 
              className={styles.carouselItem} 
              style={{ '--i': index } as React.CSSProperties}
              onClick={() => handleItemClick(item.category)}
            >
              <div className={styles.circleImageContainer}>
                <img src={item.image} alt={item.title} className={styles.circleImage} />
              </div>
              <h2 className={styles.itemTitle}>{t(`categories.${item.category}`)}</h2>
            </article>
          ))}
        </div>
    </>
  );
};

export default Marquee;