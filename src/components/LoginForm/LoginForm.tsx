// src/components/LoginForm/LoginForm.tsx
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from '@/pages/Auth/Auth.module.css';
import { SafeUser } from '@/types/User';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onSuccess?: (user: SafeUser) => void; // اختیاری شد
  redirectAfterLogin?: string; // مسیر ریدایرکت پس از ورود
  showCloseButton?: boolean;
  onClose?: () => void;
}

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginForm = ({ 
  onSuccess, 
  redirectAfterLogin ='/user' , 
  showCloseButton = true, 
  onClose 
}: LoginFormProps) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormInputs>();
  

  const onSubmit = async (data: LoginFormInputs) => {
   
    try {
      const user = await login(data.email, data.password);
      
      // حالت ۱: اگر onSuccess ارائه شده باشد
      if (onSuccess) {
        onSuccess(user);
      } 
      // حالت ۲: ریدایرکت معمولی
      else if(user.role == 'admin') {
        navigate("/admin");
      }else{
        navigate(redirectAfterLogin);
      }
    } catch {
      setError('email', { 
        type: 'manual', 
        message: t('auth.invalidCredentials') 
      });
      setError('password', { 
        type: 'manual', 
        message: t('auth.invalidCredentials') 
      });
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>{t('auth.loginTitle')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label>{t('auth.email')}</label>
          <input
            type="email"
            dir='ltr'
            {...register('email', { 
              required: t('auth.emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('auth.invalidEmail')
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
              required: t('auth.passwordRequired'),
              minLength: {
                value: 6,
                message: t('auth.passwordMinLength')
              }
            })}
          />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>
        <button type="submit" className={styles.submitButton}>
          {t('auth.login')}
        </button>
        {showCloseButton && onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
        )}
      </form>
    </div>
  );
};

export default LoginForm;