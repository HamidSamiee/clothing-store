// src/components/Layout/Layout.tsx
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Layout.module.css';
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({children} : LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
             {children || <Outlet />}
        </div>
      </main>
      
      <Footer />
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        toastClassName={styles.toast}
      />
    </div>
  );
};

export default Layout;