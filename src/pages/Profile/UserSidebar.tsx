// src/components/UserSidebar/UserSidebar.tsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './UserProfile.module.css';
import { User, ListOrdered, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PersianTooltip } from '@/ui/Tooltip/Tooltip';

const UserSidebar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        {isOpen && <h2>{t('sidebar.title', { defaultValue: 'حساب کاربری' })}</h2>}
        <button onClick={toggleSidebar} className={styles.toggleButton}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className={styles.navMenu}>
        <NavLink
          to="/user/profile"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          {!isOpen ? (
            <PersianTooltip title={t('sidebar.profile')} placement="left" arrow>
              <User className={styles.icon} />
            </PersianTooltip>
          ) : (
            <User className={styles.icon} />
          )}
          {isOpen && <span>{t('sidebar.profile')}</span>}
        </NavLink>

        <NavLink
          to="/user/orders"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          {!isOpen ? (
            <PersianTooltip title={t('sidebar.orders')} placement="left" arrow>
              <ListOrdered className={styles.icon} />
            </PersianTooltip>
          ) : (
            <ListOrdered className={styles.icon} />
          )}
          {isOpen && <span>{t('sidebar.orders')}</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default UserSidebar;
