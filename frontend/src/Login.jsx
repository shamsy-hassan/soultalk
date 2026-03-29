import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Users, ArrowRight, Shield, Globe, Zap, ChevronRight, Phone, CheckCircle2 } from 'lucide-react';
import VerifyFlow from './VerifyFlow';
import LanguageCarousel from './LanguageCarousel';
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
    <div className="relative min-h-screen st-combo1-bg flex items-center justify-center px-4 py-10 sm:py-14 overflow-hidden">
      <div className="max-w-7xl w-full mx-auto relative">
        <LanguageCarousel />

        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          {goodbyeMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="bg-gray-950/85 text-soultalk-dark-gray px-6 py-3 rounded-full shadow-lg border border-gray-800/60 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-soultalk-teal" />
                <span className="font-medium">{goodbyeMessage}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mb-6 lg:mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-45 transition-opacity duration-300 bg-soultalk-lavender/30" />
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-soultalk-gradient-start to-soultalk-gradient-end rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 w-8 h-8 lg:w-9 lg:h-9 bg-gray-950/80 rounded-full flex items-center justify-center shadow-lg border border-gray-800/60">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-soultalk-lavender" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end bg-clip-text text-transparent">
            {t('login_to_soultalk')}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-soultalk-medium-gray max-w-2xl mx-auto px-4">
            {t('soultalk_footer')}
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-950/35 px-4 py-2 text-sm text-soultalk-dark-gray shadow-sm backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-soultalk-teal shadow-[0_0_0_4px_rgba(20,184,166,0.16)]" />
              <span>Instant translation. No password.</span>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Feature Showcase */}
          <div className="space-y-6">
            {/* How It Works Card */}
            <div className="st-combo1-panel rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gray-950/35 rounded-xl border border-gray-800/60">
                  <Globe className="w-6 h-6 text-soultalk-lavender" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-soultalk-dark-gray">{t('how_it_works')}</h3>
                  <p className="text-sm text-soultalk-medium-gray">{t('real_time_translation_magic')}</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { step: "01", title: t('you_speak_your_language'), desc: t('type_naturally'), Icon: MessageSquare },
                  { step: "02", title: t('we_translate_instantly'), desc: t('ai_powered_translation'), Icon: Zap },
                  { step: "03", title: t('they_read_in_their_language'), desc: t('messages_arrive_translated'), Icon: Globe }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-950/35 rounded-xl flex items-center justify-center border border-gray-800/60">
                        <item.Icon className="w-5 h-5 text-soultalk-teal" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-soultalk-teal">{item.step}</span>
                        <h4 className="font-semibold text-soultalk-dark-gray">{item.title}</h4>
                      </div>
                      <p className="text-sm text-soultalk-medium-gray">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Example Card */}
            <div className="st-combo1-panel rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-950/35 rounded-lg border border-gray-800/60">
                  <Users className="w-5 h-5 text-soultalk-lavender" />
                </div>
                <span className="font-semibold text-soultalk-dark-gray">{t('live_example')}</span>
              </div>
              <p className="text-soultalk-medium-gray leading-relaxed">
                {t('live_example_text')}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-soultalk-dark-gray">
                <span className="underline decoration-soultalk-teal/70 underline-offset-4">See how it works</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Column - Verification Card */}
          <div className="st-combo1-surface rounded-2xl overflow-hidden">
            <div className="px-6 lg:px-8 py-5 bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-white st-white-visible">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg border border-white/20">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold">
                  {t('verify_phone_number')}
                </h2>
              </div>
              <p className="text-white/90 text-sm mt-2">
                Get started in seconds — no password needed
              </p>
            </div>
            <div className="p-6 lg:p-8 st-combo1-flow">
              <VerifyFlow onLogin={onLogin} />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🌍", title: t('cross_cultural'), desc: t('connect_across_cultures') },
            { icon: "⚡", title: t('real_time'), desc: t('instant_translation') },
            { icon: "🔒", title: t('private'), desc: t('encrypted_conversations') }
          ].map((feature, idx) => (
            <div key={idx} className="st-combo1-panel rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-soultalk-dark-gray mb-2">{feature.title}</h4>
                <p className="text-sm text-soultalk-medium-gray">{feature.desc}</p>
                <div className="mt-4 w-12 h-1 bg-soultalk-teal rounded-full mx-auto" />
            </div>
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950/35 backdrop-blur-sm rounded-full text-sm text-soultalk-dark-gray border border-gray-800/60">
            <Shield className="w-4 h-4 text-soultalk-teal" />
            <span>Secure & encrypted communication</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
