import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageFlag, getLanguageName } from './i18n';
import { ChevronDown, ChevronUp, LogOut, Settings, Globe } from 'lucide-react'; // Import icons
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { getLanguages } from './api';

const UserMenu = ({ user, onLogout, onChangeLanguage, onNavigateToProfileSetup }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (lang) => {
    onChangeLanguage(lang);
    setIsOpen(false); // Close menu after selection
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false); // Close menu after logout
  };

  const handleProfileClick = () => {
    onNavigateToProfileSetup();
    setIsOpen(false); // Close menu
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await getLanguages({ uiOnly: true });
        setAvailableLanguages(data.languages || []);
      } catch (error) {
        console.error('Failed to fetch language options:', error);
      }
    };

    loadLanguages();
  }, []);

  const currentUserAvatarUrl = resolveProfilePictureUrl(user?.profile_picture_url);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-3 mb-6 p-2 rounded-lg bg-soultalk-warm-gray w-full text-left cursor-pointer hover:bg-gray-200 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-soultalk-coral to-soultalk-teal flex items-center justify-center text-soultalk-white text-xl font-bold">
          <img
            src={currentUserAvatarUrl}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-soultalk-dark-gray">{user.username}</p>
          <p className="text-sm text-soultalk-medium-gray flex items-center">
            {t('speaking')}: {getLanguageName(user.language)} {getLanguageFlag(user.language)}
          </p>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-soultalk-medium-gray" /> : <ChevronDown className="w-5 h-5 text-soultalk-medium-gray" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-soultalk-white rounded-lg shadow-xl z-10 py-2 border border-gray-100">
          <button
            onClick={handleProfileClick}
            className="flex items-center w-full px-4 py-2 text-sm text-soultalk-dark-gray hover:bg-soultalk-warm-gray transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('profile_setup')}
          </button>
          
          <div className="border-t border-gray-100 my-1"></div> {/* Separator */}

          <div className="px-4 py-2 text-xs font-semibold text-soultalk-medium-gray flex items-center">
            <Globe className="w-3 h-3 mr-2" />
            {t('change_language')}
          </div>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                user.language === lang.code ? 'bg-soultalk-lavender text-soultalk-white' : 'text-soultalk-dark-gray hover:bg-soultalk-warm-gray'
              } transition-colors`}
            >
              {lang.flag || getLanguageFlag(lang.code)} {t(`language_${lang.code}`, { defaultValue: lang.nativeName || lang.name || lang.code })}
            </button>
          ))}

          <div className="border-t border-gray-100 my-1"></div> {/* Separator */}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-soultalk-dark-gray hover:bg-soultalk-coral hover:text-soultalk-white rounded-b-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
