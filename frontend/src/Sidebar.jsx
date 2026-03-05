import React from 'react';
import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users as UsersIcon, MessageSquare, Settings, ShieldCheck, MessageSquareText, Sun, Moon } from 'lucide-react';

const Sidebar = ({ user, onLogout, onChangeLanguage, onNavigateToProfileSetup, theme, onToggleTheme }) => {
  const { t } = useTranslation();
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-soultalk-lavender text-soultalk-white'
        : 'text-soultalk-dark-gray hover:bg-soultalk-warm-gray'
    }`;

  return (
    <aside className="w-full max-w-[300px] bg-soultalk-white/95 backdrop-blur-sm border-r border-gray-100 flex flex-col h-[100dvh] p-4 shadow-[0_18px_40px_-34px_rgba(30,41,59,0.6)] safe-pt safe-pb safe-px">
      {user && (
        <UserMenu
          user={user}
          onLogout={onLogout}
          onChangeLanguage={onChangeLanguage}
          onNavigateToProfileSetup={onNavigateToProfileSetup}
        />
      )}

      <div className="space-y-1">
        <NavLink to="/users" className={navItemClass}>
          <UsersIcon className="w-4 h-4" />
          {t('discover_souls')}
        </NavLink>
        <NavLink to="/chats" className={navItemClass}>
          <MessageSquare className="w-4 h-4" />
          {t('your_chats')}
        </NavLink>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs uppercase tracking-wide text-soultalk-medium-gray mb-2">{t('system')}</p>
        <div className="space-y-1">
          <NavLink to="/settings" className={navItemClass}>
            <Settings className="w-4 h-4" />
            {t('settings')}
          </NavLink>
          <NavLink to="/privacy" className={navItemClass}>
            <ShieldCheck className="w-4 h-4" />
            {t('privacy_policy')}
          </NavLink>
          <NavLink to="/feedback" className={navItemClass}>
            <MessageSquareText className="w-4 h-4" />
            {t('send_feedback')}
          </NavLink>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-soultalk-warm-gray text-soultalk-dark-gray px-3 py-2.5 hover:bg-gray-200 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? t('light_mode') : t('dark_mode')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
