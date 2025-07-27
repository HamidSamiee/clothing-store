// src/components/AddressForm/AddressForm.tsx
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import styles from './AddressForm.module.css';
import TextField from '@/ui/TextField/TextField';


interface AddressFormProps {
  onSubmit: (data: any) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

const AddressForm = ({ onSubmit }: AddressFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.addressForm}>
      <div className={styles.formRow}>
        <TextField
          label={t('checkout.firstName')}
          name="firstName"
          register={register}
          errors={errors}
          required
          validationSchema={{ required: t('validation.required') }}
        />
        <TextField
          label={t('checkout.lastName')}
          name="lastName"
          register={register}
          errors={errors}
          required
          validationSchema={{ required: t('validation.required') }}
        />
      </div>

      <TextField
        label={t('checkout.streetAddress')}
        name="street"
        register={register}
        errors={errors}
        required
        validationSchema={{ required: t('validation.required') }}
      />

      <div className={styles.formRow} >
        <TextField
          label={t('checkout.city')}
          name="city"
          register={register}
          errors={errors}
          required
          validationSchema={{ required: t('validation.required') }}
        />
        <TextField
          label={t('checkout.province')}
          name="province"
          register={register}
          errors={errors}
          required
          validationSchema={{ required: t('validation.required') }}
        />
      </div>

      <div className={styles.formRow}>
        <TextField
          label={t('checkout.postalCode')}
          name="postalCode"
          register={register}
          errors={errors}
          required
          validationSchema={{ required: t('validation.required') }}
        />
        <TextField
          label={t('checkout.phone')}
          name="phone"
          type="tel"
          register={register}
          errors={errors}
          required
          validationSchema={{ 
            required: t('validation.required'),
            pattern: {
              value: /^[0-9]{10,15}$/,
              message: t('validation.phoneInvalid')
            }
          }}
        />
      </div>

      <button type="submit" className={styles.submitButton}>
        {t('checkout.saveAddress')}
      </button>
    </form>
  );
};

export default AddressForm;