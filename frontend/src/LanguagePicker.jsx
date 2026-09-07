import React, { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLanguageFlag, getLanguageName } from './i18n';

const LanguagePicker = ({ languages, selectedLanguage, onSelect, className = '' }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const languageOptions = useMemo(() => {
    const normalized = (languages || []).map((language) => {
      const code = language?.code || language;
      return {
        code,
        name: getLanguageName(code),
        nativeName: language?.nativeName || '',
        catalogName: language?.name || '',
        flag: language?.flag || getLanguageFlag(code),
      };
    });
    const searchTerm = query.trim().toLocaleLowerCase();

    return normalized
      .filter((language) => {
        if (!searchTerm) return true;
        return [language.code, language.name, language.nativeName, language.catalogName]
          .some((value) => value.toLocaleLowerCase().includes(searchTerm));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [languages, query]);

  return (
    <div className={className}>
      <label className="relative block">
        <span className="sr-only">
          {t('search_language', { defaultValue: 'Search language' })}
        </span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heybuddy-medium-gray" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search_language_placeholder', { defaultValue: 'Search languages...' })}
          className="input-field pl-9"
        />
      </label>

      <div
        className="mt-3 max-h-64 overflow-y-auto rounded-xl pr-1 subtle-scrollbar"
        role="listbox"
        aria-label={t('language', { defaultValue: 'Language' })}
      >
        {languageOptions.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {languageOptions.map((language) => {
              const active = selectedLanguage === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(language.code)}
                  className={`flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                    active
                      ? 'border-heybuddy-teal bg-heybuddy-teal/10'
                      : 'border-gray-800/60 bg-gray-950/20 hover:border-heybuddy-teal/50'
                  }`}
                >
                  <span className="shrink-0 text-xl">{language.flag}</span>
                  <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-tight">
                    {language.name}
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-heybuddy-teal" />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-heybuddy-medium-gray">
            {t('no_languages_found', { defaultValue: 'No languages found.' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default LanguagePicker;
