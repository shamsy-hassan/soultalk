import { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Languages, Sparkles, Globe2 } from 'lucide-react';
import i18n, { getLanguageFlag, resolveUiLanguage } from './i18n';

const NATIVE_LANGUAGE_CONTENT = {
  en: {
    label: 'English',
    line: 'Write naturally in English. We translate instantly.',
  },
  sw: {
    label: 'Kiswahili',
    line: 'Andika kwa Kiswahili. Tunatafsiri papo hapo.',
  },
  am: {
    label: 'አማርኛ',
    line: 'በአማርኛ በቀጥታ ይጻፉ። በፍጥነት እንተርጉማለን።',
  },
  fr: {
    label: 'Français',
    line: 'Écrivez naturellement en français. Traduction instantanée.',
  },
  de: {
    label: 'Deutsch',
    line: 'Schreibe auf Deutsch. Wir übersetzen sofort.',
  },
  rw: {
    label: 'Kinyarwanda',
    line: 'Andika mu Kinyarwanda. Turahindura ako kanya.',
  },
  rn: {
    label: 'Kirundi',
    line: 'Andika mu Kirundi. Turahindura ubwo nyene.',
  },
  so: {
    label: 'Soomaali',
    line: 'Ku qor af‑Soomaali. Waxaan turjumeynaa isla markiiba.',
  },
  ar: {
    label: 'العربية',
    line: 'اكتب بالعربية بشكل طبيعي. نترجم فورًا.',
  },
  es: {
    label: 'Español',
    line: 'Escribe en español con naturalidad. Traducimos al instante.',
  },
  pt: {
    label: 'Português',
    line: 'Escreva em português naturalmente. Tradução instantânea.',
  },
  yo: {
    label: 'Yorùbá',
    line: 'Kọ ní Yorùbá rẹ. A máa túmọ̀ lẹ́sẹ̀kẹsẹ.',
  },
  ha: {
    label: 'Hausa',
    line: 'Rubuta da Hausa. Muna fassara nan take.',
  },
  zu: {
    label: 'isiZulu',
    line: 'Bhala ngesiZulu. Sihumusha ngokushesha.',
  },
  lg: {
    label: 'Luganda',
    line: 'Wandiika mu Luganda. Tuvvuunula mangu.',
  },
  aa: {
    label: 'Afar',
    line: 'Qafar afat qori. Sissik bayisna turjumna.',
  },
  ti: {
    label: 'ትግርኛ',
    line: 'ብትግርኛ ብተፈጥሮ ጽሓፍ። ብኡንብኡ ንትርጉም።',
  },
  mg: {
    label: 'Malagasy',
    line: 'Soraty amin ny teny Malagasy. Adika avy hatrany.',
  },
  it: {
    label: 'Italiano',
    line: 'Scrivi in italiano naturalmente. Traduzione immediata.',
  },
};

export default function LanguageCarousel() {
  const railRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(resolveUiLanguage(i18n.language));

  const languageItems = useMemo(
    () => Object.entries(NATIVE_LANGUAGE_CONTENT).map(([code, content]) => ({
        code,
        flag: getLanguageFlag(code),
        label: content.label,
        line: content.line,
      })),
    []
  );

  const scrollRail = (direction) => {
    if (!railRef.current) return;
    const delta = Math.max(260, Math.floor(railRef.current.clientWidth * 0.85));
    railRef.current.scrollBy({
      left: direction === 'next' ? delta : -delta,
      behavior: 'smooth',
    });
  };

  const handleLanguagePick = (languageCode) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
  };

  useEffect(() => {
    const syncSelected = (code) => setSelectedLanguage(resolveUiLanguage(code));
    i18n.on('languageChanged', syncSelected);
    return () => {
      i18n.off('languageChanged', syncSelected);
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const tick = window.setInterval(() => {
      if (isPaused) return;
      const card = rail.querySelector('[data-language-card]');
      const fallbackStep = Math.max(280, Math.floor(rail.clientWidth * 0.64));
      const step = card ? card.clientWidth + 20 : fallbackStep;
      const maxLeft = rail.scrollWidth - rail.clientWidth;

      if (rail.scrollLeft >= maxLeft - 8) {
        rail.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      rail.scrollBy({ left: step, behavior: 'smooth' });
    }, 3400);

    return () => {
      window.clearInterval(tick);
    };
  }, [isPaused, languageItems.length]);

  return (
    <section className="mb-8 sm:mb-12">
      <div className="hero-panel p-5 sm:p-7 shadow-[0_24px_64px_-44px_rgba(109,95,255,0.7)]">
        <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-soultalk-lavender/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-soultalk-coral/20 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="inline-flex items-center gap-2 text-soultalk-dark-gray font-semibold text-base sm:text-lg">
              <Languages className="w-5 h-5" />
              Choose your language
            </p>
            <p className="text-sm sm:text-base text-soultalk-medium-gray mt-1 max-w-2xl">
              Each card stays in its native language. Tap one card to translate the onboarding content below.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-soultalk-dark-gray border border-gray-100">
                <Sparkles className="w-3.5 h-3.5 text-soultalk-coral" />
                Real-time
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-soultalk-dark-gray border border-gray-100">
                <Globe2 className="w-3.5 h-3.5 text-soultalk-teal" />
                Multi-language onboarding
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail('prev')}
              className="p-2.5 rounded-xl bg-white/90 text-soultalk-dark-gray border border-gray-100 hover:bg-gray-100 transition-colors"
              aria-label="Scroll languages left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail('next')}
              className="p-2.5 rounded-xl bg-white/90 text-soultalk-dark-gray border border-gray-100 hover:bg-gray-100 transition-colors"
              aria-label="Scroll languages right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          ref={railRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="relative flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory subtle-scrollbar touch-pan-x"
        >
          {languageItems.map((lang) => {
            const isActive = lang.code === selectedLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                data-language-card="true"
                onClick={() => handleLanguagePick(lang.code)}
                className={`snap-start shrink-0 w-[min(84vw,320px)] sm:w-[280px] lg:w-[320px] rounded-2xl border p-5 text-left transition-all ${
                  isActive
                    ? 'border-soultalk-lavender bg-white shadow-md'
                    : 'border-gray-200 bg-white/95 hover:border-soultalk-lavender/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-3xl">{lang.flag}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-soultalk-medium-gray">{lang.code}</p>
                </div>
                <p className="mt-3 text-lg font-semibold text-soultalk-dark-gray break-words">{lang.label}</p>
                <p className="mt-2 text-sm text-soultalk-medium-gray">
                  {lang.line}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
