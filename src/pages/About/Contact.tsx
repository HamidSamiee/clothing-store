import React, { useState } from 'react';
import styles from './About.module.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={`${styles.contactContainer} ${darkMode ? styles.dark : ''}`}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('contact.title')}</h1>
          <p className={styles.heroSubtitle}>{t('contact.subtitle')}</p>
        </div>
      </section>

      <div className={styles.contactWrapper}>
        {/* Contact Form */}
        <section className={styles.contactFormSection}>
          <h2 className={styles.sectionTitle}>{t('contact.form.title')}</h2>
          {submitted ? (
            <div className={styles.successMessage}>
              {t('contact.form.success')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">{t('contact.form.name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">{t('contact.form.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">{t('contact.form.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">{t('contact.form.message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                ></textarea>
              </div>
              <button type="submit" className={styles.submitButton}>
                {t('contact.form.submit')}
              </button>
            </form>
          )}
        </section>

        {/* Contact Info */}
        <section className={styles.contactInfoSection}>
          <h2 className={styles.sectionTitle}>{t('contact.info.title')}</h2>
          <div className={styles.contactInfo}>
            <div className={styles.infoItem}>
              <i className="fas fa-map-marker-alt"></i>
              <h3>آدرس</h3>
              <p>{t('contact.info.address')}</p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-clock"></i>
              <h3>ساعات کاری</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('contact.info.hours')}</p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-phone"></i>
              <h3>تلفن</h3>
              <p>{t('contact.info.phone')}</p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-envelope"></i>
              <h3>ایمیل</h3>
              <p>{t('contact.info.email')}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Map */}
      <section className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.676350380228!2d51.38871131526942!3d35.68919798018948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQxJzIxLjEiTiA1McKwMjMnMjMuNiJF!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Boutique Location"
        ></iframe>
      </section>
    </div>
  );
};

export default Contact;