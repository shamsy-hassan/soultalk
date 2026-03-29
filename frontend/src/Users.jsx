import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, UserPlus, Heart, X, SlidersHorizontal, ChevronRight, Sparkles, ShieldCheck, Filter } from 'lucide-react'; // Import Heart icon
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';
import EmptyChatState from './EmptyChatState'; // Import EmptyChatState
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { getLanguages, getUsers } from './api';
import { countryCodes } from './countryCodes';

const Users = ({ user, socket }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  // Temporary state for filter (will be implemented later)
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState(null);
  const [languageFilters, setLanguageFilters] = useState([]);
  const [showLanguageFilters, setShowLanguageFilters] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [hasBioOnly, setHasBioOnly] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    if (socket) {
      socket.on('user_status', (data) => {
        setOnlineUsers(prev => {
          const newOnline = new Set(prev);
          if (data.online) {
            newOnline.add(data.username);
          } else {
            newOnline.delete(data.username);
          }
          return Array.from(newOnline);
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('user_status');
      }
    };
  }, [socket]);

  useEffect(() => {
    const loadLanguageFilters = async () => {
      try {
        const data = await getLanguages();
        setLanguageFilters(data.languages || []);
      } catch (error) {
        console.error('Error fetching language filters:', error);
      }
    };

    loadLanguageFilters();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers(user.username);
      setUsers(data.users);
      
      const online = data.users
        .filter(u => u.online)
        .map(u => u.username);
      setOnlineUsers(online);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchesLanguage = !selectedLanguageFilter || u.language === selectedLanguageFilter;
    const matchesOnline = !onlineOnly || Boolean(u.online);
    const hasBio = Boolean((u.bio || u.about || '').trim());
    const matchesBio = !hasBioOnly || hasBio;
    return matchesSearch && matchesLanguage && matchesOnline && matchesBio;
  });
  const resultsCount = filteredUsers.length;
  const activeLanguageLabel = selectedLanguageFilter
    ? `${getLanguageFlag(selectedLanguageFilter)} ${getLanguageName(selectedLanguageFilter)}`
    : t('all_languages');

  const getLanguageNameAndFlag = (code) => {
    const name = getLanguageName(code);
    const flag = getLanguageFlag(code);
    return `${name} ${flag}`;
  };

  const getCountryFromPhone = (phone) => {
    if (!phone) {
      return 'Unknown';
    }

    const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
    const matchedCountry = sortedCountryCodes.find((country) => phone.startsWith(country.code));
    return matchedCountry ? matchedCountry.name : 'Unknown';
  };

  const startChat = (targetUser) => {
    navigate(`/chat/${targetUser.username}`);
  };

  // Conditional rendering for EmptyChatState
  if (!loading && filteredUsers.length === 0 && search === '') {
    return <EmptyChatState />;
  }

  return (
    <div className="flex flex-col h-full"> {/* Full height to allow scrolling */}
      <div className="mb-5 hero-panel p-4 md:p-6">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-soultalk-lavender/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-soultalk-coral/15 blur-2xl" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between relative">
          <div>
            <h1 className="section-title mb-2">{t('find_souls')}</h1>
            <p className="text-soultalk-medium-gray text-sm dark:text-gray-400">
          {t('connect_with_people_description')}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-gray-950/35 px-3 py-1.5 text-xs font-medium text-soultalk-medium-gray shadow-sm ring-1 ring-white/10 backdrop-blur">
            <SlidersHorizontal className="h-4 w-4 text-soultalk-lavender" />
            <span>{activeLanguageLabel}</span>
            <span className="text-soultalk-medium-gray/60">•</span>
            <span>{t('results', { defaultValue: 'Results' })}: {resultsCount}</span>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 rounded-2xl mb-4 space-y-3">
        <div className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-soultalk-medium-gray">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 font-semibold text-soultalk-dark-gray">
              <Sparkles className="w-4 h-4 text-soultalk-lavender" />
              {t('how_it_works', { defaultValue: 'How it works' })}
            </span>
            <span className="text-soultalk-medium-gray/60">•</span>
            <span>{t('users_tip_1', { defaultValue: 'Tap a soul to open chat.' })}</span>
            <span className="text-soultalk-medium-gray/60">•</span>
            <span>{t('users_tip_2', { defaultValue: 'Messages translate automatically in both directions.' })}</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soultalk-medium-gray w-5 h-5 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_souls_placeholder')}
            className="input-field pl-11 pr-11 shadow-sm focus:shadow-md"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-soultalk-warm-gray dark:hover:bg-white/10"
              aria-label={t('clear_search', { defaultValue: 'Clear search' })}
            >
              <X className="h-4 w-4 text-soultalk-medium-gray dark:text-gray-300" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOnlineOnly((v) => !v)}
            className={`text-left p-4 rounded-2xl border transition-colors ${
              onlineOnly
                ? 'bg-emerald-500/10 border-emerald-400/25'
                : 'bg-soultalk-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
            }`}
          >
            <p className="font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
              <Filter className="w-4 h-4 text-soultalk-lavender" />
              {t('online_only', { defaultValue: 'Online only' })}
            </p>
            <p className="text-sm text-soultalk-medium-gray mt-1">
              {t('online_only_desc', { defaultValue: 'Show souls currently active.' })}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setHasBioOnly((v) => !v)}
            className={`text-left p-4 rounded-2xl border transition-colors ${
              hasBioOnly
                ? 'bg-emerald-500/10 border-emerald-400/25'
                : 'bg-soultalk-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
            }`}
          >
            <p className="font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-soultalk-lavender" />
              {t('has_bio_only', { defaultValue: 'With bio' })}
            </p>
            <p className="text-sm text-soultalk-medium-gray mt-1">
              {t('has_bio_only_desc', { defaultValue: 'Find souls who added an intro.' })}
            </p>
          </button>
        </div>
      </div>

      {/* Filter Chips - Placeholder */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
          onClick={() => {
            if (showLanguageFilters) {
              setShowLanguageFilters(false);
              setSelectedLanguageFilter(null);
            } else {
              setShowLanguageFilters(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors border ${
              !selectedLanguageFilter
                ? 'bg-soultalk-lavender text-soultalk-white st-white-visible border-soultalk-lavender'
                : 'bg-soultalk-warm-gray text-soultalk-medium-gray hover:bg-gray-200 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10'
            }`}
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('all_languages')}
        </button>

          {(selectedLanguageFilter || search || onlineOnly || hasBioOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedLanguageFilter(null);
                setOnlineOnly(false);
                setHasBioOnly(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full border border-gray-800/60 bg-gray-950/35 hover:bg-soultalk-warm-gray transition-colors"
            >
              <X className="h-4 w-4 text-soultalk-medium-gray" />
              <span className="text-soultalk-dark-gray">
                {t('reset', { defaultValue: 'Reset' })}
              </span>
            </button>
          )}
        </div>

        {showLanguageFilters && (
          <div className="mt-3 flex gap-2 overflow-x-auto subtle-scrollbar pb-1">
            {languageFilters.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguageFilter(lang.code)}
                type="button"
                className={`whitespace-nowrap px-3 py-2 text-sm rounded-full transition-colors border ${
                  selectedLanguageFilter === lang.code
                    ? 'bg-soultalk-lavender text-soultalk-white st-white-visible border-soultalk-lavender'
                    : 'bg-soultalk-warm-gray text-soultalk-medium-gray hover:bg-gray-200 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10'
                }`}
              >
                {lang.flag || getLanguageFlag(lang.code)} {getLanguageName(lang.code)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="card-elevated p-4 rounded-3xl animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-soultalk-warm-gray dark:bg-white/10" />
                  <div className="min-w-0 space-y-2">
                    <div className="h-4 w-28 rounded bg-soultalk-warm-gray dark:bg-white/10" />
                    <div className="h-3 w-20 rounded bg-soultalk-warm-gray dark:bg-white/10" />
                    <div className="h-3 w-32 rounded bg-soultalk-warm-gray dark:bg-white/10" />
                  </div>
                </div>
                <div className="h-5 w-5 rounded bg-soultalk-warm-gray dark:bg-white/10" />
              </div>
              <div className="mt-4 h-9 w-full rounded-full bg-soultalk-warm-gray dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto subtle-scrollbar pr-2 -mr-2"> {/* Custom scrollbar area */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredUsers.map((targetUser) => {
              const targetUserAvatarUrl = resolveProfilePictureUrl(targetUser.profile_picture_url);
              return (
              <div
                key={targetUser.id}
                role="button"
                tabIndex={0}
                className="group card-elevated p-4 rounded-3xl hover:border-soultalk-lavender hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender dark:focus:ring-offset-[#0f172a]"
                onClick={() => startChat(targetUser)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') startChat(targetUser);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={targetUserAvatarUrl}
                        alt={targetUser.username}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
                        onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                      />
                      {onlineUsers.includes(targetUser.username) ? (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 text-soultalk-coral animate-pulse" title="Connected soul">
                          <Heart className="w-full h-full fill-current" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 text-soultalk-medium-gray" title="Offline">
                          <Heart className="w-full h-full fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-soultalk-dark-gray tracking-tight dark:text-gray-100">{targetUser.username}</h4>
                      <p className={`text-xs font-medium ${onlineUsers.includes(targetUser.username) ? 'text-soultalk-coral' : 'text-soultalk-medium-gray'}`}>
                        {onlineUsers.includes(targetUser.username) ? t('online') : t('offline')}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray truncate dark:text-gray-400">
                        {t('speaks')}: {getLanguageNameAndFlag(targetUser.language)}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray truncate dark:text-gray-400">
                        {t('country')}: {getCountryFromPhone(targetUser.phone)}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray line-clamp-2 leading-relaxed dark:text-gray-400">
                        {t('about')}: {targetUser.bio || targetUser.about || t('no_bio_yet')}
                      </p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-soultalk-medium-gray group-hover:text-soultalk-coral transition-colors dark:text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startChat(targetUser);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white st-white-visible font-semibold py-2.5 px-4 hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender dark:focus:ring-offset-[#0f172a]"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('connect')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && search !== '' && ( // Only show if no users found WITH a search term
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-soultalk-warm-gray rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-soultalk-medium-gray" />
          </div>
          <h4 className="text-lg font-medium text-soultalk-dark-gray mb-2 dark:text-gray-100">{t('no_souls_found')}</h4>
          <p className="text-soultalk-medium-gray text-sm dark:text-gray-400">
            {search ? t('try_different_search_term') : t('no_other_souls_available')}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedLanguageFilter(null);
              setOnlineOnly(false);
              setHasBioOnly(false);
              setShowLanguageFilters(false);
            }}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-soultalk-warm-gray px-4 py-2 text-sm font-semibold text-soultalk-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
            {t('reset', { defaultValue: 'Reset' })}
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
