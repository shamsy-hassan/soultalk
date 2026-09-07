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
    <footer className="border-t border-emerald-400/15 bg-heybuddy-white/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-heybuddy-medium-gray">
          <p className="text-center md:text-left">{t('HeyBuddy_footer')}</p>
          <p className="flex items-center mt-2 md:mt-0 rounded-full bg-heybuddy-warm-gray/80 border border-emerald-400/15 px-3 py-1">
            {t('made_with_love')}
            <Heart className="w-4 h-4 mx-1 text-heybuddy-coral fill-current animate-pulse" />
            {t('by_HeyBuddy_team')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
