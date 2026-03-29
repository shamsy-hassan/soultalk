import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

const THEME_IDS = ['default', 'grey', 'ocean', 'purple'];
const FONT_FAMILY_IDS = ['system', 'serif', 'mono', 'rounded'];

const fontFamilyToVar = (familyId) => {
  const safeFamily = FONT_FAMILY_IDS.includes(familyId) ? familyId : 'system';
  const map = {
    system:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    rounded:
      'ui-rounded, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  };
  return map[safeFamily];
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

try {
  const storedTheme = window.localStorage.getItem('st_pref_theme') || 'default';
  const safeTheme = THEME_IDS.includes(storedTheme) ? storedTheme : 'default';
  document.documentElement.classList.add(`st-theme-${safeTheme}`);

  const storedFontScale = Number(window.localStorage.getItem('st_pref_font_scale') || '1');
  const safeFontScale = Number.isFinite(storedFontScale) ? clamp(storedFontScale, 0.95, 1.35) : 1;
  document.documentElement.style.setProperty('--st-font-scale', String(safeFontScale));

  const storedUiScale = Number(window.localStorage.getItem('st_pref_ui_scale') || '1');
  const safeUiScale = Number.isFinite(storedUiScale) ? clamp(storedUiScale, 1, 1.25) : 1;
  document.documentElement.style.setProperty('--st-ui-scale', String(safeUiScale));

  const storedFontFamily = window.localStorage.getItem('st_pref_font_family') || 'system';
  document.documentElement.style.setProperty('--st-font-family', fontFamilyToVar(storedFontFamily));
} catch (error) {
  document.documentElement.classList.add('st-theme-default');
  document.documentElement.style.setProperty('--st-font-scale', '1');
  document.documentElement.style.setProperty('--st-ui-scale', '1');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback="loading">
      <BrowserRouter> {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
