// src/utils/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../translations/en.json';
import faTranslations from '../translations/fa.json';

// تعریف نوع برای فایل‌های ترجمه
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslations;
    };
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fa: { translation: faTranslations }
    },
    lng: 'fa', // زبان پیش‌فرض
    fallbackLng: 'en', // زبان جایگزین
    interpolation: {
      escapeValue: false // اجازه می‌دهد از HTML در ترجمه‌ها استفاده شود
    },
    react: {
      useSuspense: false // برای جلوگیری از هشدار در نسخه‌های جدید ری‌اکت
    }
  });

export default i18n;