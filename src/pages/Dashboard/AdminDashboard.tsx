// src/pages/Dashboard/AdminDashboard.tsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  FiMenu, 
  FiX,
  FiShoppingBag,
  FiList,
  FiUsers,
  FiPieChart,
  FiLogOut
} from 'react-icons/fi';
import styles from './AdminDashboard.module.css';
import { PersianTooltip } from '@/ui/Tooltip/Tooltip';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          {sidebarOpen && <h2>پنل مدیریت</h2>}
          <button onClick={toggleSidebar} className={styles.toggleButton}>
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className={styles.navMenu}>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            {
              sidebarOpen == false ? 
              <PersianTooltip title="مدیریت محصولات" placement="left" arrow>
                     <FiShoppingBag className={styles.navIcon} />   
              </PersianTooltip>
              :
              <FiShoppingBag className={styles.navIcon} />   
            }
            {sidebarOpen && <span>مدیریت محصولات</span>}
          </NavLink>

          <NavLink 
            to="/admin/orders"
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            {
              sidebarOpen == false ? 
              <PersianTooltip title="مدیریت سفارشات" placement="left" arrow>
                        <FiList className={styles.navIcon} />   
              </PersianTooltip>
              :
              <FiList className={styles.navIcon} />
            }
            {sidebarOpen && <span>مدیریت سفارشات</span>}
          </NavLink>

          <NavLink 
            to="/admin/users"
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            {
              sidebarOpen == false ? 
              <PersianTooltip title="مدیریت کاربران" placement="left" arrow>
                  <FiUsers className={styles.navIcon} />
              </PersianTooltip>
              :
              <FiUsers className={styles.navIcon} />
            }            
            {sidebarOpen && <span>مدیریت کاربران</span>}
          </NavLink>

          <NavLink 
            to="/admin/stats"
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            {
              sidebarOpen == false ? 
              <PersianTooltip title="آمار و گزارشات" placement="left" arrow>
                  <FiPieChart className={styles.navIcon} />
              </PersianTooltip>
              :
              <FiPieChart className={styles.navIcon} />
            }            
            {sidebarOpen && <span>آمار و گزارشات</span>}
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={logout}>
          {
              sidebarOpen == false ? 
              <PersianTooltip title="خروج از سیستم" placement="left" arrow>
                          <FiLogOut className={styles.navIcon} />
              </PersianTooltip>
              :
              <FiLogOut className={styles.navIcon} />
            }            
            {sidebarOpen && <span>خروج از سیستم</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.expanded : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;