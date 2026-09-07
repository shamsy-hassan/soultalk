import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const EmptyChatState = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-heybuddy-coral">
        <MessageSquare className="h-6 w-6" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-heybuddy-dark-gray mb-3">{t('empty_chat_heading')}</h2>
      <p className="text-heybuddy-medium-gray mb-6 max-w-xl">{t('empty_chat_subheading')}</p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/users')} // Assuming /users is the Find Souls route
          className="btn-primary w-full"
        >
          {t('find_a_soul')}
        </button>
      </div>

      <p className="text-xs text-heybuddy-medium-gray mt-8 italic">
        {t('inspiring_quote_about_connection_quoted', {
          quote: t('inspiring_quote_about_connection'),
          defaultValue: '"{{quote}}"',
        })}
      </p>
    </div>
  );
};

export default EmptyChatState;
