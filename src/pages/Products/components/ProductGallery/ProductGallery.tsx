// src/components/ProductGallery/ProductGallery.tsx
import { useState } from 'react';
import styles from './ProductGallery.module.css';
import { FiZoomIn } from 'react-icons/fi';
import ImageModal from '@/ui/ImageModal/ImageModal';

interface ProductGalleryProps {
    image: string; 
    selectedImage?: number;
    onSelectImage?: (index: number) => void;
  }

  const ProductGallery = ({ 
    image, 
    selectedImage = 0, 
    // onSelectImage = () => {} // مقدار پیش‌فرض تابع خالی
  }: ProductGalleryProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);



  return (
    <div className={styles.galleryContainer}>
      {/* تصویر اصلی */}
      <div className={styles.mainImageWrapper} onClick={() => setIsModalOpen(true)}>
        <img 
          src={image} 
          alt={`Product ${selectedImage + 1}`} 
          className={styles.mainImage}
          loading="lazy"
        />
        <div className={styles.zoomIcon}>
          <FiZoomIn size={24} />
        </div>
      </div>

      {/* تصاویر کوچک */}
      {/* <div className={styles.thumbnails}>
        {image.map((img, index) => (
          <div 
            key={index}
            className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
            onClick={() => onSelectImage(index)}
          >
            <img 
              src={img} 
              alt={`Thumbnail ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>/ */}

      {/* مدال برای نمایش تصویر در سایز بزرگ */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={image}
      />
    </div>
  );
};

export default ProductGallery;