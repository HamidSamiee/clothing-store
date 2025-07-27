import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import styles from './Auth.module.css';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/User';
import { toast } from 'react-toastify';
import { useTheme } from '@/hooks/useTheme';

const Register = () => {
  const { t } = useTranslation();
  const { register: registerAuth } = useAuth();
  const { darkMode } = useTheme();


  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<User>();

  const onSubmit = async (userData: User) => {
    try {
      await registerAuth(userData);
      toast.success(t('auth.registerSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('auth.registerError'));
    }
  };

  return (
    <div className={`${styles.authContainer} ${darkMode ? styles.dark : ''}`}>
      <h2 className={styles.authTitle}>{t('auth.registerTitle')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label>{t('auth.name')}</label>
          <input
            {...register('name', { 
              required: t('auth.nameRequired') as string,
              minLength: {
                value: 3,
                message: t('auth.nameMinLength')
              }
            })}
          />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>{t('auth.email')}</label>
          <input
            type="email"
            {...register('email', { 
              required: t('auth.emailRequired') as string,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('auth.emailInvalid')
              }
            })}
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>{t('auth.password')}</label>
          <input
            type="password"
            {...register('password', { 
              required: t('auth.passwordRequired') as string,
              minLength: {
                value: 6,
                message: t('auth.passwordMinLength')
              }
            })}
          />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>{t('auth.phone')} ({t('auth.optional')})</label>
          <input
            type="tel"
            {...register('phone')}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('auth.address')} ({t('auth.optional')})</label>
          <textarea
            rows={3}
            {...register('address')}
            className={styles.textarea}
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('auth.registering') : t('auth.register')}
        </button>
      </form>
    </div>
  );
};

export default Register;