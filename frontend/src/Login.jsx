import React from 'react';
import { MessageSquare, Sparkles, Users } from 'lucide-react';
import VerifyFlow from './VerifyFlow';
import { useTranslation } from 'react-i18next';


const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-gray-50">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            {t('login_to_soultalk')}
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('soultalk_footer')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span role="img" aria-label="globe" className="text-2xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('how_it_works')}</h3>
                <p className="text-sm text-gray-600">{t('real_time_translation_magic')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">{t('you_speak_your_language')}</h4>
                  <p className="text-sm text-gray-600">{t('type_naturally')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">{t('we_translate_instantly')}</h4>
                  <p className="text-sm text-gray-600">{t('ai_powered_translation')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">{t('they_read_in_their_language')}</h4>
                  <p className="text-sm text-gray-600">{t('messages_arrive_translated')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">{t('verify_phone_number')}</h2>
            <VerifyFlow onLogin={onLogin} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl mb-2">🌍</div>
            <h4 className="font-semibold text-gray-900">{t('cross_cultural')}</h4>
            <p className="text-sm text-gray-600 mt-1">{t('connect_across_cultures')}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-gray-900">{t('real_time')}</h4>
            <p className="text-sm text-gray-600 mt-1">{t('instant_translation')}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-gray-900">{t('private')}</h4>
            <p className="text-sm text-gray-600 mt-1">{t('encrypted_conversations')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
