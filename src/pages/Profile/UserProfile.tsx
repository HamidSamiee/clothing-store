// src/pages/Profile/UserProfile.tsx
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './UserProfile.module.css';
import TextField from '@/ui/TextField/TextField';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const UserProfile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  console.log(user)
  const { register, handleSubmit, formState: { errors } } = useForm<UserData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });

  const onSubmit = (data: UserData) => {
    updateUser(data);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('profile.title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField
          label={t('profile.fullName')}
          name="name"
          register={register}
          errors={errors}
          validationSchema={{ required: t('validation.required') }}
        />
        
        <TextField
          label={t('profile.email')}
          name="email"
          type="email"
          register={register}
          errors={errors}
          disabled
        />
        
        <TextField
          label={t('profile.phone')}
          name="phone"
          type="tel"
          register={register}
          errors={errors}
          validationSchema={{
            pattern: {
              value: /^[0-9]{11}$/,
              message: t('validation.phoneInvalid')
            }
          }}
        />
        
        <TextField
          label={t('profile.address')}
          name="address"
          register={register}
          errors={errors}
          multiline
          rows={3}
        />
        
        <button type="submit" className={styles.submitButton}>
          {t('profile.saveChanges')}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;