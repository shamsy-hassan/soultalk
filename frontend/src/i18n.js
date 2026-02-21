import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationSW from './locales/sw/translation.json';
import translationAM from './locales/am/translation.json';
import translationFR from './locales/fr/translation.json'; // Added
import translationDE from './locales/de/translation.json'; // Added
import translationRW from './locales/rw/translation.json'; // Added
import translationRN from './locales/rn/translation.json'; // Added
import translationSO from './locales/so/translation.json'; // Added
import translationAR from './locales/ar/translation.json'; // Added

const resources = {
  en: {
    translation: translationEN,
  },
  sw: {
    translation: translationSW,
  },
  am: {
    translation: translationAM,
  },
  fr: { // Added
    translation: translationFR,
  },
  de: { // Added
    translation: translationDE,
  },
  rw: { // Added
    translation: translationRW,
  },
  rn: { // Added
    translation: translationRN,
  },
  so: { // Added
    translation: translationSO,
  },
  ar: { // Added
    translation: translationAR,
  },
};

export const getLanguageName = (code) => {
  const languages = {
    'en': i18n.t('language_english'),
    'sw': i18n.t('language_swahili'),
    'am': i18n.t('language_amharic'),
    'fr': i18n.t('language_french'),
    'ar': i18n.t('language_arabic'),
    'es': i18n.t('language_spanish'),
    'pt': i18n.t('language_portuguese'),
    'yo': i18n.t('language_yoruba'),
    'ha': i18n.t('language_hausa'),
    'zu': i18n.t('language_zulu'),
    'rw': i18n.t('language_kinyarwanda'),
    'rn': i18n.t('language_kirundi'),
    'so': i18n.t('language_somali')
  };
  return languages[code] || code;
};

export const getLanguageFlag = (code) => {
  const flags = {
    'en': '🇬🇧',
    'sw': '🇹🇿',
    'am': '🇪🇹',
    'fr': '🇫🇷',
    'ar': '🇸🇦',
    'rw': '🇷🇼', // Rwanda
    'rn': '🇧🇮', // Burundi
    'so': '🇸🇴'  // Somalia
  };
  return flags[code] || '🌐';
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
      order: ['localStorage', 'navigator'], // Prioritize localStorage, then browser language
      caches: ['localStorage'], // Persist the chosen language in localStorage
    },
  });

export default i18n;