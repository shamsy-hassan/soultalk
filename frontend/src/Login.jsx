import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Users } from 'lucide-react';
import VerifyFlow from './VerifyFlow';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';


const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [goodbyeMessage, setGoodbyeMessage] = useState(null);

  useEffect(() => {
    if (location.state && location.state.goodbyeMessage) {
      setGoodbyeMessage(location.state.goodbyeMessage);
      const timer = setTimeout(() => {
        setGoodbyeMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl w-full w-full mx-auto">
        <div className="text-center mb-12">
          {goodbyeMessage && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
              {goodbyeMessage}
            </div>
          )}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-soultalk-coral to-soultalk-teal rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-soultalk-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-soultalk-lavender rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-soultalk-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-soultalk-dark-gray mb-4">
            {t('login_to_soultalk')}
          </h1>
          <p className="text-xl text-soultalk-medium-gray mb-8 max-w-2xl mx-auto">
            {t('soultalk_footer')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="card space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-soultalk-warm-gray rounded-lg">
                <span role="img" aria-label="globe" className="text-2xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold text-soultalk-dark-gray">{t('how_it_works')}</h3>
                <p className="text-sm text-soultalk-medium-gray">{t('real_time_translation_magic')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-soultalk-warm-gray text-soultalk-dark-gray rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium text-soultalk-dark-gray">{t('you_speak_your_language')}</h4>
                  <p className="text-sm text-soultalk-medium-gray">{t('type_naturally')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-soultalk-warm-gray text-soultalk-dark-gray rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium text-soultalk-dark-gray">{t('we_translate_instantly')}</h4>
                  <p className="text-sm text-soultalk-medium-gray">{t('ai_powered_translation')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-soultalk-warm-gray text-soultalk-dark-gray rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium text-soultalk-dark-gray">{t('they_read_in_their_language')}</h4>
                  <p className="text-sm text-soultalk-medium-gray">{t('messages_arrive_translated')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-soultalk-warm-gray to-soultalk-white rounded-xl border border-gray-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-soultalk-coral" />
                <span className="font-medium text-soultalk-dark-gray">{t('live_example')}</span>
              </div>
              <p className="text-sm text-soultalk-medium-gray mt-2">
                {t('live_example_text')}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-soultalk-dark-gray mb-6">{t('verify_phone_number')}</h2>
            <VerifyFlow onLogin={onLogin} />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-soultalk-warm-gray rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🌍</div>
            <h4 className="font-semibold text-soultalk-dark-gray">{t('cross_cultural')}</h4>
            <p className="text-sm text-soultalk-medium-gray mt-2">{t('connect_across_cultures')}</p>
          </div>
          <div className="text-center p-6 bg-soultalk-warm-gray rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-soultalk-dark-gray">{t('real_time')}</h4>
            <p className="text-sm text-soultalk-medium-gray mt-2">{t('instant_translation')}</p>
          </div>
          <div className="text-center p-6 bg-soultalk-warm-gray rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-soultalk-dark-gray">{t('private')}</h4>
            <p className="text-sm text-soultalk-medium-gray mt-2">{t('encrypted_conversations')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;