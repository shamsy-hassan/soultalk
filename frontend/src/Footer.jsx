import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();
  const location = useLocation();

  // Don't show footer on chat pages
  if (location.pathname.startsWith('/chat/')) {
    return null;
  }

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>{t('soultalk_footer')}</p>
          <p className="flex items-center mt-2 md:mt-0">
            {t('made_with_love')}
            <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" />
            by SoulTalk Team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;