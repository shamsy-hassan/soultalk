export const PREF_THEME_KEY = 'st_pref_theme';
export const PREF_FONT_SCALE_KEY = 'st_pref_font_scale';
export const PREF_FONT_FAMILY_KEY = 'st_pref_font_family';
export const PREF_UI_SCALE_KEY = 'st_pref_ui_scale';
export const PREF_MESSAGE_SOUND_KEY = 'st_pref_message_sound';
export const PREF_MESSAGE_VIBRATE_KEY = 'st_pref_message_vibrate';

export const THEME_IDS = ['default', 'grey', 'ocean', 'purple'];
export const FONT_FAMILY_IDS = ['system', 'serif', 'mono', 'rounded'];

export const readBool = (key, fallback = false) => {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
};

export const writeBool = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(Boolean(value)));
};

export const readString = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  return raw;
};

export const readNumber = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const setRootVar = (name, value) => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(name, String(value));
};

export const setFontFamilyVar = (familyId) => {
  const safeFamily = FONT_FAMILY_IDS.includes(familyId) ? familyId : 'system';
  const map = {
    system:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    rounded:
      'ui-rounded, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  };
  setRootVar('--st-font-family', map[safeFamily]);
};

const THEME_VARS = {
  default: {
    '--st-white': '5 46 22',
    '--st-warm-gray': '6 78 59',
    '--st-coral': '34 197 94',
    '--st-teal': '16 185 129',
    '--st-lavender': '22 163 74',
    '--st-dark-gray': '236 253 245',
    '--st-medium-gray': '167 243 208',
    '--st-gradient-start': '22 163 74',
    '--st-gradient-end': '5 150 105',
  },
  grey: {
    '--st-white': '15 23 42',
    '--st-warm-gray': '30 41 59',
    '--st-coral': '96 165 250',
    '--st-teal': '34 211 238',
    '--st-lavender': '167 139 250',
    '--st-dark-gray': '248 250 252',
    '--st-medium-gray': '148 163 184',
    '--st-gradient-start': '96 165 250',
    '--st-gradient-end': '34 211 238',
  },
  ocean: {
    '--st-white': '1 42 45',
    '--st-warm-gray': '4 54 58',
    '--st-coral': '34 211 238',
    '--st-teal': '56 189 248',
    '--st-lavender': '14 165 233',
    '--st-dark-gray': '236 254 255',
    '--st-medium-gray': '165 243 252',
    '--st-gradient-start': '14 165 233',
    '--st-gradient-end': '34 211 238',
  },
  purple: {
    '--st-white': '30 11 45',
    '--st-warm-gray': '44 19 66',
    '--st-coral': '244 114 182',
    '--st-teal': '167 139 250',
    '--st-lavender': '139 92 246',
    '--st-dark-gray': '250 245 255',
    '--st-medium-gray': '233 213 255',
    '--st-gradient-start': '139 92 246',
    '--st-gradient-end': '244 114 182',
  },
};

export const applyTheme = (themeId) => {
  if (typeof document === 'undefined') return 'default';

  const safeTheme = THEME_IDS.includes(themeId) ? themeId : 'default';
  const root = document.documentElement;

  THEME_IDS.forEach((id) => root.classList.remove(`st-theme-${id}`));
  root.classList.add(`st-theme-${safeTheme}`);
  root.dataset.stTheme = safeTheme;

  const vars = THEME_VARS[safeTheme] || THEME_VARS.default;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  return safeTheme;
};

