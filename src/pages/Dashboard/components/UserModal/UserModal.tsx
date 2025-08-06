import { SafeUser, User } from '@/types/User';
import { useEffect, useRef, useState } from 'react';
import TextField from '@/ui/TextField/TextField';
import { useForm } from 'react-hook-form';
import styles from './UserModal.module.css';
import useClickOutside from '@/hooks/useClickOutside';
import RHFSelect from '@/ui/RHFSelect/RHFselect';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: SafeUser & { password?: string }) => Promise<void>;
  user: SafeUser & { password?: string };
  mode: 'view' | 'edit' | 'add';
}

const roleOptions = [
    { value: 'user', label: 'کاربر عادی' },
    { value: 'admin', label: 'مدیر' }
  ];

const UserModal = ({ isOpen, onClose, onSubmit, user, mode }: UserModalProps) => {

    const modalRef = useRef<HTMLDivElement>(null);
    
    // استفاده از هوک سفارشی برای تشخیص کلیک خارج از مودال
    useClickOutside(modalRef, onClose);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<User>({
    defaultValues: user || {
      id: 0,
      name: '',
      email: '',
      password: '',
      address: '',
      phone: '',
      orders: [],
      role: 'user'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({
        id: 0,
        name: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        orders: [],
        role: 'user'
      });
    }
  }, [user, reset]);

  const onFormSubmit = async (data: User) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3>
            {mode === 'add' ? 'افزودن کاربر جدید' : 
             mode === 'edit' ? 'ویرایش کاربر' : 'جزئیات کاربر'}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className={styles.modalBody}>
          <TextField
            label="نام کامل"
            name="name"
            register={register}
            errors={errors}
            required
            disabled={mode === 'view'}
            validationSchema={{
              required: 'نام کامل الزامی است'
            }}
          />
          
          <TextField
            label="ایمیل"
            name="email"
            type="email"
            register={register}
            errors={errors}
            required
            disabled={mode === 'view'}
            validationSchema={{
              required: 'ایمیل الزامی است',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'ایمیل معتبر نیست'
              }
            }}
          />
          
          {mode === 'add' && (
            <TextField
              label="رمز عبور"
              name="password"
              type="password"
              register={register}
              errors={errors}
              required
              validationSchema={{
                required: 'رمز عبور الزامی است',
                minLength: {
                  value: 6,
                  message: 'رمز عبور باید حداقل ۶ کاراکتر باشد'
                }
              }}
            />
          )}
          
          <TextField
            label="تلفن"
            name="phone"
            type="tel"
            register={register}
            errors={errors}
            required
            disabled={mode === 'view'}
            validationSchema={{
              required: 'تلفن الزامی است',
              pattern: {
                value: /^[0-9]{10,11}$/,
                message: 'شماره تلفن معتبر نیست'
              }
            }}
          />
          
          <div className={styles.formGroup}>
            <label>آدرس</label>
            <textarea
              {...register('address')}
              disabled={mode === 'view'}
              rows={3}
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.formGroup}>
            <RHFSelect
                label="نقش"
                name="role"
                disabled={mode === 'view'}
                options={roleOptions}
                register={register}
                required
            />
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
            >
              انصراف
            </button>
            {mode !== 'view' && (
              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : mode === 'add' ? 'افزودن کاربر' : 'ذخیره تغییرات'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;