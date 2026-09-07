import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Menu, Sparkles } from 'lucide-react';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

function Navbar({ user, onMenuClick, isScrolled }) {
  const { t } = useTranslation();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/users') return t('discover_souls');
    if (location.pathname.startsWith('/chat/')) return t('chat');
    if (location.pathname === '/profile-setup') return t('change_profile_picture');
    return '';
  };
  const currentUserAvatarUrl = resolveProfilePictureUrl(user?.profile_picture_url);

  return (
    <header className={`sticky top-0 z-30 bg-heybuddy-white/90 backdrop-blur-lg border-b border-emerald-400/15 transition-all duration-300 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-emerald-500/10 rounded-xl border border-transparent hover:border-emerald-400/20 transition-all duration-200 active:scale-95"
            aria-label={t('toggle_sidebar')}
          >
            <Menu className="w-6 h-6 text-heybuddy-dark-gray" />
          </button>

          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-heybuddy-coral to-heybuddy-teal rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white fill-current st-white-visible" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-heybuddy-coral to-heybuddy-teal bg-clip-text text-transparent">
                {t('HeyBuddy_title')}
              </h1>
              <p className="text-xs text-heybuddy-medium-gray">{t('connect_across_cultures')}</p>
            </div>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-heybuddy-dark-gray">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* User Menu Trigger (Avatar) */}
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1.5 hover:bg-emerald-500/10 rounded-xl border border-transparent hover:border-emerald-400/20 transition-all duration-200">
            <img
              src={currentUserAvatarUrl}
              alt={t('profile_photo')}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-heybuddy-coral/20"
              onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
            />
            <Sparkles className="w-4 h-4 text-heybuddy-lavender opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
