import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import styles from './RHFSelect.module.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface RHFSelectProps {
  label: string;
  name: string;
  options: SelectOption[];
  register: UseFormRegister<any>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const RHFSelect: React.FC<RHFSelectProps> = ({
  label,
  name,
  options,
  register,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`${styles.selectContainer} ${className}`}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <select
        className={styles.select}
        {...register(name)}
        id={name}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RHFSelect;