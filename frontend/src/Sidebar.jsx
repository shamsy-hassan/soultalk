import React from 'react';
import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users as UsersIcon, MessageSquare, Settings, ShieldCheck, MessageSquareText } from 'lucide-react';

const Sidebar = ({ user, onLogout, onChangeLanguage, onNavigateToProfileSetup, unreadCount = 0 }) => {
  const { t } = useTranslation();
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-soultalk-lavender text-soultalk-white'
        : 'text-soultalk-dark-gray hover:bg-soultalk-warm-gray'
    }`;

  return (
    <aside
      className="w-full max-w-[300px] backdrop-blur-sm border-r flex flex-col h-[100dvh] p-4 shadow-[0_18px_40px_-34px_rgba(30,41,59,0.6)] safe-pt safe-pb safe-px bg-soultalk-white/95 border-gray-100"
    >
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
          <span className="relative">
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-soultalk-coral text-soultalk-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
          {t('your_chats')}
        </NavLink>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs uppercase tracking-wide mb-2 text-soultalk-medium-gray">{t('system')}</p>
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
    </aside>
  );
};

export default Sidebar;
