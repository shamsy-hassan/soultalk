import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, MessageSquareText, User, Globe2, Accessibility, Info, ChevronRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_UI_LANGUAGES, getLanguageFlag, getLanguageName, resolveUiLanguage } from './i18n';
import {
  PREF_THEME_KEY,
  PREF_FONT_SCALE_KEY,
  PREF_FONT_FAMILY_KEY,
  PREF_UI_SCALE_KEY,
  PREF_MESSAGE_SOUND_KEY,
  PREF_MESSAGE_VIBRATE_KEY,
  THEME_IDS,
  FONT_FAMILY_IDS,
  readBool,
  writeBool,
  readString,
  readNumber,
  clamp,
  setRootVar,
  setFontFamilyVar,
  applyTheme,
} from './theme';

const Settings = ({ user, onChangeLanguage }) => {
  const { t } = useTranslation();
  const [uiLanguage, setUiLanguage] = useState(() => resolveUiLanguage(user?.language));
  const [theme, setTheme] = useState(() => {
    const stored = readString(PREF_THEME_KEY, 'default');
    return THEME_IDS.includes(stored) ? stored : 'default';
  });
  const [fontScale, setFontScale] = useState(() => clamp(readNumber(PREF_FONT_SCALE_KEY, 1), 0.95, 1.35));
  const [uiScale, setUiScale] = useState(() => clamp(readNumber(PREF_UI_SCALE_KEY, 1), 1, 1.25));
  const [fontFamily, setFontFamily] = useState(() => {
    const stored = readString(PREF_FONT_FAMILY_KEY, 'system');
    return FONT_FAMILY_IDS.includes(stored) ? stored : 'system';
  });
  const [messageSound, setMessageSound] = useState(() => readBool(PREF_MESSAGE_SOUND_KEY, true));
  const [messageVibrate, setMessageVibrate] = useState(() => readBool(PREF_MESSAGE_VIBRATE_KEY, true));

  const sortedLanguages = useMemo(() => {
    const langs = [...SUPPORTED_UI_LANGUAGES];
    langs.sort((a, b) => getLanguageName(a).localeCompare(getLanguageName(b)));
    return langs;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PREF_THEME_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = clamp(Number(fontScale) || 1, 0.95, 1.35);
    window.localStorage.setItem(PREF_FONT_SCALE_KEY, String(next));
    setRootVar('--st-font-scale', next);
  }, [fontScale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = clamp(Number(uiScale) || 1, 1, 1.25);
    window.localStorage.setItem(PREF_UI_SCALE_KEY, String(next));
    setRootVar('--st-ui-scale', next);
  }, [uiScale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const safe = FONT_FAMILY_IDS.includes(fontFamily) ? fontFamily : 'system';
    window.localStorage.setItem(PREF_FONT_FAMILY_KEY, safe);
    setFontFamilyVar(safe);
  }, [fontFamily]);

  useEffect(() => {
    writeBool(PREF_MESSAGE_SOUND_KEY, messageSound);
  }, [messageSound]);

  useEffect(() => {
    writeBool(PREF_MESSAGE_VIBRATE_KEY, messageVibrate);
  }, [messageVibrate]);

  useEffect(() => {
    setUiLanguage(resolveUiLanguage(user?.language));
  }, [user?.language]);

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h1 className="section-title">{t('settings_title')}</h1>
        <p className="text-sm text-heybuddy-medium-gray mt-1">{t('settings_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="border-b border-slate-200 pb-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-heybuddy-dark-gray flex items-center gap-2">
                <User className="w-4 h-4 text-heybuddy-lavender" />
                {t('account')}
              </h2>
              <p className="text-sm text-heybuddy-medium-gray mt-1">
                {t('account_subtitle')}
              </p>
            </div>
            <Link
              to="/profile-setup"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-heybuddy-warm-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors text-sm font-semibold text-heybuddy-dark-gray"
            >
              <Camera className="w-4 h-4" />
              {t('edit_profile')}
            </Link>
          </div>

          <div className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-heybuddy-medium-gray">{t('username')}</span>
              <span className="font-semibold text-heybuddy-dark-gray truncate">{user?.username || t('unknown')}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-heybuddy-medium-gray">{t('phone')}</span>
              <span className="font-semibold text-heybuddy-dark-gray truncate">{user?.phone || t('not_set')}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-heybuddy-medium-gray">{t('language')}</span>
              <span className="font-semibold text-heybuddy-dark-gray truncate">
                {getLanguageFlag(resolveUiLanguage(user?.language))} {getLanguageName(resolveUiLanguage(user?.language))}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-heybuddy-medium-gray">{t('bio')}</span>
              <span className="font-semibold text-heybuddy-dark-gray text-right leading-snug">
                {(user?.bio || '').trim() ? user.bio : t('no_bio_yet')}
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5 space-y-4">
          <h2 className="text-lg font-semibold text-heybuddy-dark-gray flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-heybuddy-lavender" />
            {t('language_and_region')}
          </h2>

          <label className="block text-sm text-heybuddy-dark-gray dark:text-gray-100">
            {t('ui_language')}
            <select
              value={uiLanguage}
              onChange={async (e) => {
                const next = resolveUiLanguage(e.target.value);
                setUiLanguage(next);
                if (typeof onChangeLanguage === 'function') {
                  await onChangeLanguage(next);
                }
              }}
              className="input-field mt-1"
            >
              {sortedLanguages.map((code) => (
                <option key={code} value={code}>
                  {getLanguageFlag(code)} {getLanguageName(code)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-heybuddy-medium-gray">
            {t('language_note')}
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5 space-y-4">
          <h2 className="text-lg font-semibold text-heybuddy-dark-gray flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-heybuddy-lavender" />
            {t('accessibility')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block text-sm text-heybuddy-dark-gray">
              {t('font_size')}
              <select
                value={String(fontScale)}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="input-field mt-1"
              >
                <option value="1">{t('font_size_default')}</option>
                <option value="1.08">{t('font_size_large')}</option>
                <option value="1.16">{t('font_size_xlarge')}</option>
                <option value="1.25">{t('font_size_xxlarge')}</option>
              </select>
            </label>

            <label className="block text-sm text-heybuddy-dark-gray">
              {t('font_type')}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input-field mt-1"
              >
                <option value="system">{t('font_type_system')}</option>
                <option value="rounded">{t('font_type_rounded')}</option>
                <option value="serif">{t('font_type_serif')}</option>
                <option value="mono">{t('font_type_mono')}</option>
              </select>
            </label>

            <div className="md:col-span-2 rounded-2xl border border-emerald-400/15 bg-heybuddy-warm-gray p-4">
	              <div className="flex items-center justify-between gap-3">
	                <p className="font-semibold text-heybuddy-dark-gray">
	                  {t('magnification')}
	                </p>
	                <span className="text-xs font-semibold text-heybuddy-medium-gray">
	                  {t('percent_value', {
	                    value: Math.round(uiScale * 100),
	                    defaultValue: '{{value}}%',
	                  })}
	                </span>
	              </div>
              <p className="text-sm text-heybuddy-medium-gray mt-1">
                {t('magnification_desc')}
              </p>
              <input
                type="range"
                min="1"
                max="1.25"
                step="0.05"
                value={uiScale}
                onChange={(e) => setUiScale(Number(e.target.value))}
                className="mt-3 w-full accent-heybuddy-coral"
              />
	              <div className="mt-2 flex items-center justify-between text-xs text-heybuddy-medium-gray">
	                <span>{t('percent_value', { value: 100, defaultValue: '{{value}}%' })}</span>
	                <span>{t('percent_value', { value: 125, defaultValue: '{{value}}%' })}</span>
	              </div>
	            </div>

            <button
              type="button"
              onClick={() => setMessageSound((v) => !v)}
              className={`text-left p-4 rounded-2xl border transition-colors ${
                messageSound
                  ? 'bg-emerald-500/10 border-emerald-400/25'
                  : 'bg-heybuddy-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
              }`}
              aria-pressed={messageSound}
            >
              <p className="font-semibold text-heybuddy-dark-gray">
                {t('message_sound')}
              </p>
              <p className="text-sm text-heybuddy-medium-gray mt-1">
                {t('message_sound_desc')}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMessageVibrate((v) => !v)}
              className={`text-left p-4 rounded-2xl border transition-colors ${
                messageVibrate
                  ? 'bg-emerald-500/10 border-emerald-400/25'
                  : 'bg-heybuddy-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
              }`}
              aria-pressed={messageVibrate}
            >
              <p className="font-semibold text-heybuddy-dark-gray">
                {t('message_vibrate')}
              </p>
              <p className="text-sm text-heybuddy-medium-gray mt-1">
                {t('message_vibrate_desc')}
              </p>
            </button>
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5 space-y-4">
          <h2 className="text-lg font-semibold text-heybuddy-dark-gray flex items-center gap-2">
            <Info className="w-4 h-4 text-heybuddy-lavender" />
            {t('themes')}
          </h2>
          <p className="text-sm text-heybuddy-medium-gray">
            {t('themes_desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'default',
                title: t('theme_default'),
                swatches: ['bg-heybuddy-coral', 'bg-heybuddy-teal', 'bg-heybuddy-lavender'],
              },
              {
                id: 'grey',
                title: t('theme_grey'),
                swatches: ['bg-neutral-300', 'bg-neutral-500', 'bg-neutral-700'],
              },
              {
                id: 'ocean',
                title: t('theme_ocean'),
                swatches: ['bg-cyan-400', 'bg-blue-400', 'bg-sky-400'],
              },
              {
                id: 'purple',
                title: t('theme_purple'),
                swatches: ['bg-fuchsia-400', 'bg-violet-400', 'bg-purple-400'],
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`text-left p-4 rounded-2xl border transition-colors ${
                  theme === item.id
                    ? 'bg-emerald-500/10 border-emerald-400/25'
                    : 'bg-heybuddy-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
                }`}
                aria-pressed={theme === item.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-heybuddy-dark-gray">{item.title}</p>
                  {theme === item.id && (
                    <span className="text-xs font-semibold text-heybuddy-coral">
                      {t('active')}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {item.swatches.map((cls) => (
                    <span key={cls} className={`w-4 h-4 rounded-full ring-1 ring-black/10 ${cls}`} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5 space-y-3">
          <h2 className="text-lg font-semibold text-heybuddy-dark-gray mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-heybuddy-lavender" />
            {t('support_and_trust')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              to="/privacy"
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-heybuddy-warm-gray text-heybuddy-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t('privacy_policy')}
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </Link>
            <Link
              to="/feedback"
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-heybuddy-warm-gray text-heybuddy-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" />
                {t('send_feedback')}
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </Link>
          </div>

          <div className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-heybuddy-medium-gray">
            {t('support_note')}
          </div>
        </section>

        <section className="border-b border-slate-200 pb-5 space-y-3 xl:col-span-2">
          <h2 className="text-lg font-semibold text-heybuddy-dark-gray flex items-center gap-2">
            <Info className="w-4 h-4 text-heybuddy-lavender" />
            {t('about_HeyBuddy')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: t('about_feature_1'),
                body: t('about_feature_1_body'),
              },
              {
                title: t('about_feature_2'),
                body: t('about_feature_2_body'),
              },
              {
                title: t('about_feature_3'),
                body: t('about_feature_3_body'),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
                <p className="font-semibold text-heybuddy-dark-gray">{item.title}</p>
                <p className="text-sm text-heybuddy-medium-gray mt-1">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
