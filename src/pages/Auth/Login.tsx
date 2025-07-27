
import styles from './Auth.module.css';
import LoginForm from '@/components/LoginForm/LoginForm';



const Login = () => {

  return (
    <div className={styles.authContainer}>
      <LoginForm 
        redirectAfterLogin="/profile" // پس از ورود به پروفایل هدایت شود
        showCloseButton={false}
      />
    </div>
  );
};

export default Login;