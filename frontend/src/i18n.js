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
import translationES from './locales/es/translation.json';
import translationPT from './locales/pt/translation.json';
import translationYO from './locales/yo/translation.json';
import translationHA from './locales/ha/translation.json';
import translationZU from './locales/zu/translation.json';
import translationLG from './locales/lg/translation.json';
import translationAA from './locales/aa/translation.json';
import translationTI from './locales/ti/translation.json';
import translationMG from './locales/mg/translation.json';
import translationIT from './locales/it/translation.json';

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
  es: {
    translation: translationES,
  },
  pt: {
    translation: translationPT,
  },
  yo: {
    translation: translationYO,
  },
  ha: {
    translation: translationHA,
  },
  zu: {
    translation: translationZU,
  },
  lg: {
    translation: translationLG,
  },
  aa: {
    translation: translationAA,
  },
  ti: {
    translation: translationTI,
  },
  mg: {
    translation: translationMG,
  },
  it: {
    translation: translationIT,
  },
};

export const SUPPORTED_UI_LANGUAGES = Object.keys(resources);

export const resolveUiLanguage = (code) => {
  if (!code) return 'en';
  if (resources[code]) return code;

  // Handle regional locales like en-US, fr-CA, etc.
  const baseCode = code.split('-')[0];
  if (resources[baseCode]) return baseCode;

  return 'en';
};

export const getLanguageName = (code) => {
  if (!code) {
    return '';
  }
  return i18n.t(`language_${code}`, { defaultValue: code });
};

export const getLanguageFlag = (code) => {
  const flags = {
    'en': '🇬🇧',
    'sw': '🇹🇿',
    'am': '🇪🇹',
    'fr': '🇫🇷',
    'ar': '🇸🇦',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'pt': '🇵🇹',
    'yo': '🇳🇬',
    'ha': '🇳🇬',
    'zu': '🇿🇦',
    'rw': '🇷🇼', // Rwanda
    'rn': '🇧🇮', // Burundi
    'so': '🇸🇴',  // Somalia
    'lg': '🇺🇬',
    'aa': '🇩🇯',
    'ti': '🇪🇷',
    'mg': '🇲🇬',
    'it': '🇮🇹'
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
