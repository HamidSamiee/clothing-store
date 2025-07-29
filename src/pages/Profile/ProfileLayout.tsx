// src/pages/Profile/ProfileLayout.tsx
import { Outlet } from 'react-router-dom';
import styles from './UserProfile.module.css';
import { lazy } from 'react';
const UserSidebar = lazy(() => import('@/pages/Profile/UserSidebar'));

const ProfileLayout = () => {
  return (
    <div className={styles.layout}>
      <UserSidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
