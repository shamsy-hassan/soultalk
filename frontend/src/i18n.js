import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationSW from './locales/sw/translation.json';
import translationAM from './locales/am/translation.json';

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
    'zu': i18n.t('language_zulu')
  };
  return languages[code] || code;
};

export const getLanguageFlag = (code) => {
  const flags = {
    'en': '🇺🇸',
    'sw': '🇹🇿',
    'am': '🇪🇹',
    'fr': '🇫🇷',
    'ar': '🇸🇦'
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
  });

export default i18n;