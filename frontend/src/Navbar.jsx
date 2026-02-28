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
    <header className={`sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SoulTalk
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('connect_across_cultures')}</p>
            </div>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* User Menu Trigger (Avatar) */}
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200">
            <img
              src={currentUserAvatarUrl}
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
              onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
            />
            <Sparkles className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
