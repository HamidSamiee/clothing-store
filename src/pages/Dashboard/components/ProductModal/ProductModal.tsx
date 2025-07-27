import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import TextField from '@/ui/TextField/TextField';
import { 
  getProductById,
  addProduct,
  updateProduct 
} from '@/services/productService';
import styles from './ProductModal.module.css';
import { Product } from '@/types/Product';
import useClickOutside from '@/hooks/useClickOutside';
import { toast } from 'react-toastify';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number ;
  onSuccess: () => void;
}

const ProductModal = ({ isOpen, onClose, productId, onSuccess }: ProductModalProps) => {

    const modalRef = useRef<HTMLDivElement>(null);
    
    // استفاده از هوک سفارشی برای تشخیص کلیک خارج از مودال
    useClickOutside(modalRef, onClose);

  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Product | Omit<Product, 'id'>>({
    defaultValues: {
      sizes: [] as string[], // تعیین صریح نوع آرایه
      colors: [] as string[],
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      reset({
        name: '',
        price: 0,
        description: '',
        category: 'men',
        image: '',
        sizes: [],
        colors: [],
        stock: 0,
        featured: false,
        discount: 0,
        rating: 0
      });
    }
  }, [productId, reset]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await getProductById(productId!);
      // تنظیم مقادیر فرم با داده‌های محصول
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof Product, value);
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: Product | Omit<Product, 'id'>) => {
    setIsLoading(true);
    
    try {
      if (productId) {
        await updateProduct(productId, data as Product);
        toast.success('محصول با موفقیت آپدیت شد')
      } else {
        await addProduct(data as Omit<Product, 'id'>);
        toast.success('محصول با موفقیت اضافه شد')
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSafeArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(i => i.trim());
    return [];
  };
  const sizesValue = getSafeArray(watch('sizes'));
  const colorsValue = getSafeArray(watch('colors'));


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3>{productId ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.modalBody}>
          {isLoading && productId ? (
            <div className={styles.loading}>در حال بارگذاری...</div>
          ) : (
            <>
              <TextField
                label="نام محصول"
                name="name"
                register={register}
                errors={errors}
                required
                validationSchema={{ required: 'نام محصول الزامی است' }}
              />

              <div className={styles.formRow}>
                <TextField
                  label="قیمت (تومان)"
                  name="price"
                  type="number"
                  register={register}
                  errors={errors}
                  required
                  validationSchema={{ 
                    required: 'قیمت الزامی است',
                    min: { value: 0, message: 'قیمت نمی‌تواند منفی باشد' }
                  }}
                />
                <TextField
                  label="تخفیف (%)"
                  name="discount"
                  type="number"
                  register={register}
                  errors={errors}
                  validationSchema={{ 
                    min: { value: 0, message: 'تخفیف نمی‌تواند منفی باشد' },
                    max: { value: 100, message: 'تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد' }
                  }}
                />
              </div>

              <div className={styles.formRow}>
                <TextField
                  label="موجودی"
                  name="stock"
                  type="number"
                  register={register}
                  errors={errors}
                  required
                  validationSchema={{ 
                    required: 'موجودی الزامی است',
                    min: { value: 0, message: 'موجودی نمی‌تواند منفی باشد' }
                  }}
                />
                <TextField
                  label="امتیاز (1-5)"
                  name="rating"
                  type="number"
                  register={register}
                  errors={errors}
                  validationSchema={{ 
                    min: { value: 1, message: 'حداقل امتیاز ۱ است' },
                    max: { value: 5, message: 'حداکثر امتیاز ۵ است' }
                  }}
                />
              </div>

              <TextField
                label="دسته‌بندی"
                name="category"
                register={register}
                errors={errors}
                required
                validationSchema={{ required: 'دسته‌بندی الزامی است' }}
              />

              <TextField
                label="آدرس تصویر"
                name="image"
                register={register}
                errors={errors}
                required
                validationSchema={{ required: 'آدرس تصویر الزامی است' }}
              />

              <TextField
                label="سایزها (با کاما جدا کنید)"
                name="sizes"
                register={register}
                errors={errors}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const arrayValue = e.target.value.split(',').map(i => i.trim());
                  setValue('sizes', arrayValue);
                }}
                value={sizesValue.join(', ')}
              />

              <TextField
                label="رنگ‌ها (با کاما جدا کنید)"
                name="colors"
                register={register}
                errors={errors}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const arrayValue = e.target.value.split(',').map(i => i.trim());
                  setValue('colors', arrayValue);
                }}
                value={colorsValue.join(', ')}
              />

              <TextField
                label="توضیحات"
                name="description"
                register={register}
                errors={errors}
                multiline
                rows={4}
              />

              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                />
                <label htmlFor="featured">محصول ویژه</label>
              </div>
            </>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'در حال ذخیره...' : productId ? 'ذخیره تغییرات' : 'افزودن محصول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;



