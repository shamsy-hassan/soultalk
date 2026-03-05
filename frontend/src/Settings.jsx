import React from 'react';
import { Moon, Sun, ShieldCheck, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Settings = ({ theme, onToggleTheme }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5 md:p-6">
        <h1 className="section-title">{t('settings_title')}</h1>
        <p className="text-sm text-soultalk-medium-gray mt-1">{t('settings_subtitle')}</p>
      </div>

      <div className="card-elevated p-5 rounded-2xl">
        <h2 className="text-lg font-semibold text-soultalk-dark-gray mb-3">{t('appearance')}</h2>
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soultalk-warm-gray text-soultalk-dark-gray border border-gray-200 hover:bg-gray-200 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? t('switch_to_light_mode') : t('switch_to_dark_mode')}
        </button>
      </div>

      <div className="card-elevated p-5 rounded-2xl">
        <h2 className="text-lg font-semibold text-soultalk-dark-gray mb-3">{t('support_and_trust')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/privacy"
            className="flex items-center gap-2 p-3 rounded-xl bg-soultalk-warm-gray text-soultalk-dark-gray border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            {t('privacy_policy')}
          </Link>
          <Link
            to="/feedback"
            className="flex items-center gap-2 p-3 rounded-xl bg-soultalk-warm-gray text-soultalk-dark-gray border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            <MessageSquareText className="w-4 h-4" />
            {t('send_feedback')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
