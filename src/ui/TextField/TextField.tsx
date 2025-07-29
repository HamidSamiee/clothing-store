import styles from './TextField.module.css';
import {
  FieldError,
  FieldErrors,
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions
} from 'react-hook-form';
import { ReactNode } from 'react';

interface TextFieldProps<T extends FieldValues = FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  validationSchema?: RegisterOptions<T>;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextField = <T extends FieldValues>({
  label,
  name,
  type = 'text',
  register,
  errors,
  required = false,
  validationSchema = {},
  disabled = false,
  multiline = false,
  rows = 3,
  value,
  onChange,
}: TextFieldProps<T>) => {
  const error = errors[name] as FieldError | undefined;
  const errorMessage = error?.message as ReactNode;

  const registered = register(name, validationSchema);

  return (
    <div className={styles.textFieldContainer}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>

      {multiline ? (
        <textarea
          {...registered}
          id={name}
          disabled={disabled}
          autoComplete="off"
          className={styles.textarea}
          rows={rows}
          onChange={(e) => {
            registered.onChange(e); // for RHF
            onChange?.(e);           // custom
          }}
        />
      ) : (
        <input
          {...registered}
          type={type}
          id={name}
          disabled={disabled}
          autoComplete="off"
          className={styles.input}
          onChange={(e) => {
            registered.onChange(e); // for RHF
            onChange?.(e);           // custom
          }}
          value={value} 
        />
      )}

      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  );
};

export default TextField;
