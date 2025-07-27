// src/components/TextField/TextField.tsx
import React from 'react';
import styles from './TextField.module.css';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegister<any>; // در صورت داشتن فرم خاص، جای any را با نوع فرم خود جایگزین کنید
  errors: FieldErrors<any>;
  required?: boolean;
  validationSchema?: object;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  type = 'text',
  register,
  errors ,
  required = false,
  validationSchema = {},
  disabled = false,
}) => {
  return (
    <div className={styles.textFieldContainer}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <input
        {...register(name, validationSchema)}
        type={type}
        id={name}
        disabled={disabled}
        autoComplete="off"
        className={styles.input}
      />
      {errors && errors[name] && (
        <span className={styles.errorMessage}>
          {errors[name]?.message}
        </span>
      )}
    </div>
  );
};

export default TextField;