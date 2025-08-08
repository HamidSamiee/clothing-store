import { useState, useEffect, useRef, useCallback } from 'react';
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
import ImageUploader from '@/components/ImageUploader/ImageUploader';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | number |undefined ;
  onSuccess: () => void;
}
type ProductFormData = Omit<Product, 'id'>;

const ProductModal = ({ isOpen, onClose, productId, onSuccess }: ProductModalProps) => {

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside<HTMLDivElement>(modalRef, onClose);

  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: {
      sizes: [] as string[], // تعیین صریح نوع آرایه
      colors: [] as string[],
    }
  });

  const [isLoading, setIsLoading] = useState(false);



  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductById(productId!);
      // صراحتاً تایپ هر پراپرتی بررسی می‌شود
      setValue('name', data.name);
      setValue('price', data.price);
      setValue('description', data.description);
      setValue('category', data.category);
      setValue('image', data.image);
      setValue('sizes', data.sizes);
      setValue('colors', data.colors);
      setValue('stock', data.stock);
      setValue('featured', data.featured);
      setValue('discount', data.discount);
      setValue('rating', data.rating);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  },[productId,setValue])
  
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
  }, [productId, reset, fetchProduct]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    
    try {
      // تبدیل sizes و colors به آرایه معتبر
      const processedData = {
        ...data,
        sizes: convertToArray(data.sizes),
        colors: convertToArray(data.colors)
      };
  
      if (productId) {
        await updateProduct(productId, processedData);
        toast.success('محصول با موفقیت به‌روزرسانی شد');
      } else {
        await addProduct(processedData);
        toast.success('محصول با موفقیت اضافه شد');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('خطا در ذخیره محصول');
    } finally {
      setIsLoading(false);
    }
  };
  
  // تابع کمکی برای تبدیل به آرایه
  function convertToArray(input: unknown): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(item => String(item?.toString().trim()));
    if (typeof input === 'string') return input.split(',').map(item => item.trim());
    return [String(input)];
  }

  const getSafeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String);
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

              <ImageUploader
                uploadPreset={import.meta.env.VITE_UPLOAD_PRESET}
                cloudName={import.meta.env.VITE_CLOUD_NAME}
                onUploadSuccess={(url) => setValue('image', url)}
                initialImageUrl={watch('image')}
              />

              <TextField
                label="سایزها (با کاما جدا کنید)"
                name="sizes"
                register={register}
                errors={errors}
                onChange={(e) => {
                  const arrayValue = e.target.value.split(',').map(i => i.trim());
                  setValue('sizes', arrayValue);
                }}
                value={sizesValue.join(', ')}
              />

              <TextField
                label="رنگ‌ها(با کاما جدا کنید)"
                name="colors"
                register={register}
                errors={errors}
                onChange={(e) => {
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



