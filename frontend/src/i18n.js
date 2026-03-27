import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationSW from './locales/sw/translation.json';
import translationAM from './locales/am/translation.json';
import translationFR from './locales/fr/translation.json'; 
import translationDE from './locales/de/translation.json'; 
import translationRW from './locales/rw/translation.json'; 
import translationRN from './locales/rn/translation.json'; 
import translationSO from './locales/so/translation.json'; 
import translationAR from './locales/ar/translation.json'; 
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
  fr: { 
    translation: translationFR,
  },
  de: { 
    translation: translationDE,
  },
  rw: { 
    translation: translationRW,
  },
  rn: { 
    translation: translationRN,
  },
  so: { 
    translation: translationSO,
  },
  ar: { 
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

export const SOULTALK_USER_STORAGE_KEY = 'soultalk_user';
export const I18NEXT_LANGUAGE_STORAGE_KEY = 'i18nextLng';

export const setUiLanguage = async (code) => {
  const nextLanguage = resolveUiLanguage(code);
  const currentLanguage = resolveUiLanguage(i18n.language);
  if (currentLanguage === nextLanguage) {
    return { language: nextLanguage, changed: false };
  }
  await i18n.changeLanguage(nextLanguage);
  return { language: nextLanguage, changed: true };
};

export const hardReload = () => {
  if (typeof window === 'undefined') return;
  window.location.reload();
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

let languageStorageSyncInstalled = false;
const installLanguageStorageSync = () => {
  if (languageStorageSyncInstalled) return;
  if (typeof window === 'undefined') return;
  languageStorageSyncInstalled = true;

  window.addEventListener('storage', (event) => {
    if (!event.key) return;

    if (event.key === I18NEXT_LANGUAGE_STORAGE_KEY && event.newValue) {
      void setUiLanguage(event.newValue);
      return;
    }

    if (event.key === SOULTALK_USER_STORAGE_KEY && event.newValue) {
      try {
        const nextUser = JSON.parse(event.newValue);
        if (nextUser?.language) {
          void setUiLanguage(nextUser.language);
        }
      } catch {
        // ignore invalid JSON
      }
    }
  });
};

installLanguageStorageSync();

export default i18n;
