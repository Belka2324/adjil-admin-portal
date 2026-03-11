/**
 * i18n Configuration for ADMIN PORTAL ADJIL
 * Supports English, Arabic, and French
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '@/../public/locales/en/common.json';
import arCommon from '@/../public/locales/ar/common.json';
import frCommon from '@/../public/locales/fr/common.json';

const resources = {
  en: { translation: enCommon },
  ar: { translation: arCommon },
  fr: { translation: frCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
