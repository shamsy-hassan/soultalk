import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageFlag, getLanguageName } from './i18n';
import { ChevronDown, ChevronUp, LogOut, Settings, Globe, Shield } from 'lucide-react'; // Import icons
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { getLanguages } from './api';

const UserMenu = ({ user, onLogout, onChangeLanguage, onNavigateToProfileSetup }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [showAccountActions, setShowAccountActions] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setShowLanguageOptions(false);
      setShowAccountActions(false);
    }
  };

  const handleLanguageChange = (lang) => {
    onChangeLanguage(lang);
    setShowLanguageOptions(false);
    setIsOpen(false); // Close menu after selection
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false); // Close menu after logout
    setShowAccountActions(false);
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
        setShowLanguageOptions(false);
        setShowAccountActions(false);
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
        className="flex items-center space-x-3 mb-6 p-2.5 rounded-xl bg-soultalk-warm-gray border border-gray-200 w-full text-left cursor-pointer hover:bg-gray-200 transition-colors"
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
        <div className="absolute left-0 mt-2 w-full bg-soultalk-white/98 backdrop-blur-sm rounded-xl shadow-xl z-10 p-2 border border-gray-100 space-y-2">
          <button
            onClick={handleProfileClick}
            className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-soultalk-dark-gray hover:bg-soultalk-warm-gray rounded-lg transition-colors"
          >
            <span className="inline-flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              {t('profile_setup')}
            </span>
          </button>

          <button
            onClick={() => setShowLanguageOptions((prev) => !prev)}
            className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-soultalk-dark-gray hover:bg-soultalk-warm-gray rounded-lg transition-colors"
          >
            <span className="inline-flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              {t('change_language')}
            </span>
            <span className="text-xs text-soultalk-medium-gray">
              {getLanguageFlag(user.language)} {getLanguageName(user.language)}
            </span>
          </button>

          {showLanguageOptions && (
            <div className="rounded-lg border border-gray-100 overflow-hidden bg-white">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center w-full px-3 py-2 text-sm ${
                    user.language === lang.code ? 'bg-soultalk-lavender text-soultalk-white' : 'text-soultalk-dark-gray hover:bg-soultalk-warm-gray'
                  } transition-colors`}
                >
                  {lang.flag || getLanguageFlag(lang.code)} {t(`language_${lang.code}`, { defaultValue: lang.nativeName || lang.name || lang.code })}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAccountActions((prev) => !prev)}
            className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-soultalk-medium-gray hover:bg-soultalk-warm-gray rounded-lg transition-colors"
          >
            <span className="inline-flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              {t('account_actions')}
            </span>
            {showAccountActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAccountActions && (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-soultalk-dark-gray hover:bg-soultalk-coral hover:text-soultalk-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
