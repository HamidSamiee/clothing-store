import { Link, NavLink } from 'react-router-dom';
import logo from '../../../public/logo/logo.png';
import { useTranslation } from 'react-i18next';
import { FaMoon, FaSun, FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaBoxOpen, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import styles from './Header.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import Search from './Search';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`${styles.header} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div className={styles.languageSwitcher}>
            <button 
              onClick={() => changeLanguage('fa')} 
              className={i18n.language === 'fa' ? styles.active : ''}
            >
              فارسی
            </button>
            <span>|</span>
            <button 
              onClick={() => changeLanguage('en')} 
              className={i18n.language === 'en' ? styles.active : ''}
            >
              English
            </button>
          </div>
          <div className={styles.topLinks}>
            {user ? (
              <>
                <Link to="/user" className={styles.topLink}>
                  <FaUser /> {user.name}
                </Link>
                <button onClick={logout} className={styles.topLink}>
                  <FaSignOutAlt /> {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.topLink}>
                  {t('header.login')}
                </Link>
                <Link to="/register" className={styles.topLink}>
                  {t('header.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <div className={styles.mobileMenuToggle}>
            <button 
              onClick={toggleMobileMenu} 
              className={styles.mobileMenuButton}
              aria-label="منو"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div className={styles.logoContainer}>
            <Link to="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
              {t('header.logo1')}
              <img src={logo} alt="logo" />
              {t('header.logo2')}
            </Link>
          </div>

          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
           
            <div className={styles.mobileSearch}>
              <Search isMobile={true} />
            </div>
           
            <ul className={styles.navList}>
              <li>
                <NavLink className={({isActive}) => isActive ? styles.active : ''} to="/" end onClick={() => setMobileMenuOpen(false)}>
                  <FaHome className={styles.menuIcon} />
                  {t('header.home')}
                </NavLink>
              </li>
              <li>
                <NavLink className={({isActive}) => isActive ? styles.active : ''} to="/products" onClick={() => setMobileMenuOpen(false)}>
                  <FaBoxOpen className={styles.menuIcon} />
                  {t('header.products')}
                </NavLink>
              </li>
              <li>
                <NavLink className={({isActive}) => isActive ? styles.active : ''} to="/about" onClick={() => setMobileMenuOpen(false)}>
                  <FaInfoCircle className={styles.menuIcon} />
                  {t('header.about')}
                </NavLink>
              </li>
              <li>
                <NavLink className={({isActive}) => isActive ? styles.active : ''} to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <FaEnvelope className={styles.menuIcon} />
                  {t('header.contact')}
                </NavLink>
              </li>
            </ul>
            
          </nav>

          <div className={styles.actions}>
            <div className={styles.desktopSearch}>
              <Search isMobile={false} />
            </div>

            <button onClick={toggleTheme} className={styles.themeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <Link to="/cart" className={styles.cartIcon} onClick={() => setMobileMenuOpen(false)}>
              <FaShoppingCart />
              <span className={styles.cartCount}>{toPersianNumbers(items.length)}</span>
            </Link>
          </div>

          {mobileMenuOpen && (
            <div 
              className={styles.menuBackdrop}
              onClick={toggleMobileMenu}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;