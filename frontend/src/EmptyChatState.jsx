import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const EmptyChatState = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full">
      {/* Central Illustration: Two abstract souls connecting */}
      <div className="relative w-40 h-40 mb-8">
        {/* Outer soul */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-soultalk-coral/40 to-soultalk-teal/40 animate-pulse-slow"></div>
        {/* Inner soul 1 */}
        <div className="absolute w-24 h-24 rounded-full bg-soultalk-coral top-4 left-4 animate-float-one shadow-lg flex items-center justify-center">
            <Heart className="w-12 h-12 text-soultalk-white" />
        </div>
        {/* Inner soul 2 */}
        <div className="absolute w-24 h-24 rounded-full bg-soultalk-teal bottom-4 right-4 animate-float-two shadow-lg flex items-center justify-center">
            <Heart className="w-12 h-12 text-soultalk-white" />
        </div>
        {/* Connecting string art */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full bg-soultalk-lavender opacity-50 transform rotate-45"></div>
            <div className="h-px w-full bg-soultalk-lavender opacity-50 transform -rotate-45"></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-soultalk-dark-gray mb-3">{t('empty_chat_heading')}</h2>
      <p className="text-soultalk-medium-gray mb-6">{t('empty_chat_subheading')}</p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/users')} // Assuming /users is the Find Souls route
          className="btn-primary w-full"
        >
          {t('find_a_soul')}
        </button>
        <button
          onClick={() => navigate('/profile-setup')} // Navigate to profile setup for language options
          className="btn-secondary w-full border border-soultalk-lavender bg-transparent text-soultalk-lavender hover:bg-soultalk-lavender hover:text-soultalk-white"
        >
          {t('explore_languages')}
        </button>
      </div>

      <p className="text-xs text-soultalk-medium-gray mt-8 italic">
        "{t('inspiring_quote_about_connection')}"
      </p>
    </div>
  );
};

export default EmptyChatState;