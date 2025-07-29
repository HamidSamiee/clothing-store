// src/components/ProductInfo/ProductInfo.tsx
import styles from './ProductInfo.module.css';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { toPersianNumbers, toPersianNumbersWithComma } from '@/utils/toPersianNumbers';
import { useTranslation } from 'react-i18next';
import { PersianTooltip } from '@/ui/Tooltip/Tooltip';

type CategoryKey = 
  | "men"
  | "women"
  | "kids"
  | "sport"
  | "shoes"
  | "accessories"
  | "ورزشی"
  | "زنانه"
  | "مردانه"
  | "بچه گانه"
  | "اکسسوری";


interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    discount?: number;
    category: CategoryKey | string ;
    rating: number;
    stock: number;
    sizes: string[];
    colors: string[];
  };
  finalPrice: number;
  rating: number;
  isWishlisted: boolean ;
  stars: string;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  onShare: () => void;
}

const ProductInfo = ({
  product,
  finalPrice,
  rating,
  stars,
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
  quantity,
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  isWishlisted,
  onShare
}: ProductInfoProps) => {
  const { t } = useTranslation();


  return (
    <div className={styles.infoContainer}>
      <h1 className={styles.productTitle}>{product.name}</h1>
      
      {/* رتبه‌بندی و دسته‌بندی */}
      <div className={styles.metaContainer}>
        <div className={styles.rating}>
          <span className={styles.stars}>{stars}</span>
          <span className={styles.ratingNumber}>({rating.toFixed(1)})</span>
        </div>
        <span className={styles.category}> {t('categories.' + product.category as string, { defaultValue: product.category })}</span>
      </div>

      {/* قیمت */}
      <div className={styles.priceContainer}>
        {product.discount && (
          <div className={styles.discountSection}>
            <span className={styles.originalPrice}>
              {toPersianNumbersWithComma(product.price)} {t('product.currency')}
            </span>
            <span className={styles.discountBadge}>
              {toPersianNumbersWithComma(product.discount)}% {t('product.discount')}
            </span>
          </div>
        )}
        <div className={styles.finalPrice}>
          {toPersianNumbersWithComma(finalPrice)} {t('product.currency')}
        </div>
      </div>

      {/* موجودی */}
      <div className={styles.stock}>
        {product.stock > 0 ? (
          <span className={styles.inStock}>
            {t('product.inStock')}: {toPersianNumbersWithComma(product.stock)}
          </span>
        ) : (
          <span className={styles.outOfStock}>{t('product.outOfStock')}</span>
        )}
      </div>

      {/* سایزها */}
      <div className={styles.sizeSection}>
        <h3>{t('product.sizes')}</h3>
        <div className={styles.sizeOptions}>
          {product.sizes.map(size => (
            <button
              key={size}
              className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ''}`}
              onClick={() => onSelectSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>

        {/* رنگ‌ها */}
        <div className={styles.colorSection}>
            <h3>{t('product.colors')}</h3>
            <div className={styles.colorOptions}>
            {product.colors.map(color => (
                <button
                key={color}
                className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ''}`}
                onClick={() => onSelectColor(color)}
                title={color}
                style={{ backgroundColor: getColorHex(color) }}
                />
            ))}
            </div>
        </div>

        {/* تعداد */}
        <div className={styles.quantitySection}>
            <h3>{t('product.quantity')}</h3>
            <div className={styles.quantityControl}>
            <button 
                className={styles.quantityButton}
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
                -
            </button>
            <span className={styles.quantityNumber}>{toPersianNumbers(quantity)}</span>
            <button 
                className={styles.quantityButton}
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
            >
                +
            </button>
            </div>
        </div>

      </div>
      {/* دکمه‌های اقدام */}
      <div className={styles.actionButtons}>

        <PersianTooltip title={`${product.stock <= 0 ? "متاسفانه این محصول در حال حاضر موجود نمی‌باشد " : !selectedSize ? "لطفاً سایز مورد نظر خود را انتخاب کنید" : !selectedColor ? "لطفاً رنگ مورد نظر خود را انتخاب کنید" : ""}`} >
            <button
                className={`${styles.addToCartButton} ${product.stock <= 0 || !selectedSize || !selectedColor ? "" : ""}`}
                onClick={onAddToCart}
                disabled={product.stock <= 0 || !selectedSize || !selectedColor}
            >
                {product.stock > 0 ? t('product.addToCart') : t('product.outOfStock')}
            </button>
        </PersianTooltip>
        
        <div className={styles.secondaryActions}>
        <PersianTooltip title="افزودن به فهرست علاقه مندی ها" >
            <button 
                className={styles.wishlistButton}
                onClick={onAddToWishlist}
            >
                <FiHeart size={20} 
                  className={`${isWishlisted ? styles.active : ''}`}
                  // fill={isWishlisted ? 'red' : 'none'}
                  // color={isWishlisted ? 'red' : 'currentColor'}
                 />
            </button>
        </PersianTooltip>
        <PersianTooltip title="اشتراک گذاری"  >
          <button  onClick={onShare} className={styles.shareButton}>
            <FiShare2 size={20} />
          </button>
        </PersianTooltip>

        </div>
      </div>
    </div>
  );
};

// تابع کمکی برای تبدیل نام رنگ به کد HEX
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'آبی': '#0000FF',
    'سفید': '#FFFFFF',
    'مشکی': '#000000',
    'خاکستری': '#808080',
    'قهوه‌ای': '#A52A2A',
    'نارنجی': '#FFA500',
    'صورتی': '#FFC0CB',
    'قرمز': '#FF0000',
    'سبز': '#008000',
    'خردلی': '#FFDB58',
  };
  return colorMap[colorName] || '#CCCCCC';
}

export default ProductInfo;