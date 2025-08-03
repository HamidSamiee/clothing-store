// src/components/Footer/Footer.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import styles from './Footer.module.css';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/services/newsletterService';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// در بخش handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  // اعتبارسنجی پیشرفته
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError(t('footer.invalidEmail'));
    return;
  }

  setLoading(true);
  
  try {
    await subscribeToNewsletter(email.trim());
    setEmail('');
  } finally {
    setLoading(false);
  }
};


  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.container}>
          <div className={styles.footerColumn}>
            <h3>{t('footer.about')}</h3>
            <p>{t('footer.aboutText')}</p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>{t('footer.links')}</h3>
            <ul>
              <li>
                <Link to="/">{t('footer.home')}</Link>
              </li>
              <li>
                <Link to="/products">{t('footer.products')}</Link>
              </li>
              <li>
                <Link to="/about">{t('footer.about')}</Link>
              </li>
              <li>
                <Link to="/contact">{t('footer.contact')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3>{t('footer.contact')}</h3>
            <ul className={styles.contactInfo}>
              <li>{t('footer.address')}</li>
              <li>{t('footer.phone')}</li>
              <li>{t('footer.email')}</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
              <h3>{t('footer.newsletter')}</h3>
              <p>{t('footer.newsletterText')}</p>
              <form className={styles.newsletterForm} onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading}>
                  {loading ? t('footer.subscribing') : t('footer.subscribe')}
                </button>
              </form>
              {error && <p className={styles.errorMessage}>{error}</p>}
            </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className={styles.paymentMethods}>
            <span>{t('footer.paymentMethods')}:</span>
            <img src="/images/payment/visa.png" alt="Visa" />
            <img src="/images/payment/mastercard.png" alt="Mastercard" />
            <img src="/images/payment/zarinpal.jpg" alt="Zarinpal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;