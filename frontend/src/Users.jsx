import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageSquare, Search, SlidersHorizontal, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFlag, getLanguageName } from './i18n';
import { getChatPartners, getLanguages, getUsers, getFavorites, setFavorite } from './api';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Users = ({ user, socket }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [chatPartners, setChatPartners] = useState([]);
  const [favoriteNames, setFavoriteNames] = useState(new Set());
  const [languageFilters, setLanguageFilters] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getUsers(user.username),
      getChatPartners(user.username),
      getFavorites(user.username),
      getLanguages(),
    ]).then(([usersData, chatsData, favoritesData, languagesData]) => {
      if (cancelled) return;
      const nextUsers = Array.isArray(usersData?.users) ? usersData.users : [];
      setUsers(nextUsers);
      setChatPartners(Array.isArray(chatsData?.chats) ? chatsData.chats : []);
      setFavoriteNames(new Set((favoritesData?.favorites || []).map((item) => item.username)));
      setLanguageFilters(Array.isArray(languagesData?.languages) ? languagesData.languages : []);
      setOnlineUsers(new Set(nextUsers.filter((item) => item.online).map((item) => item.username)));
    }).catch((error) => {
      console.error('Failed to load contacts:', error);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user.username]);

  useEffect(() => {
    if (!socket) return undefined;
    const handleStatus = (data) => {
      if (!data?.username) return;
      setOnlineUsers((current) => {
        const next = new Set(current);
        if (data.online) next.add(data.username);
        else next.delete(data.username);
        return next;
      });
    };
    socket.on('user_status', handleStatus);
    return () => socket.off('user_status', handleStatus);
  }, [socket]);

  const recentNames = useMemo(
    () => new Set(chatPartners.map((partner) => partner.username)),
    [chatPartners]
  );

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((item) => {
        if (term && !item.username.toLowerCase().includes(term)) return false;
        if (selectedLanguage && item.language !== selectedLanguage) return false;
        if (onlineOnly && !onlineUsers.has(item.username)) return false;
        return true;
      })
      .sort((a, b) => {
        const favoriteOrder = Number(favoriteNames.has(b.username)) - Number(favoriteNames.has(a.username));
        if (favoriteOrder) return favoriteOrder;
        const recentOrder = Number(recentNames.has(b.username)) - Number(recentNames.has(a.username));
        if (recentOrder) return recentOrder;
        return a.username.localeCompare(b.username);
      });
  }, [users, search, selectedLanguage, onlineOnly, onlineUsers, favoriteNames, recentNames]);

  const toggleFavorite = async (target) => {
    const nextValue = !favoriteNames.has(target.username);
    try {
      await setFavorite(user.username, target.username, nextValue);
      setFavoriteNames((current) => {
        const next = new Set(current);
        if (nextValue) next.add(target.username);
        else next.delete(target.username);
        return next;
      });
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="section-title">{t('contacts', { defaultValue: 'Contacts' })}</h1>
          <p className="mt-1 text-sm text-heybuddy-medium-gray">
            {visibleUsers.length} {t('people', { defaultValue: 'people' })}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/friends')} className="btn-secondary gap-2">
          <Heart className="h-4 w-4" />
          {t('friends', { defaultValue: 'Friends' })}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-heybuddy-medium-gray" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-10 pr-10"
              placeholder={t('search_people', { defaultValue: 'Search people' })}
              aria-label={t('search_people', { defaultValue: 'Search people' })}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2" aria-label={t('clear_search')}>
                <X className="h-4 w-4 text-heybuddy-medium-gray" />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setOnlineOnly((value) => !value)} className={`rounded-lg border px-3 py-2 text-sm ${onlineOnly ? 'border-teal-200 bg-teal-50 text-heybuddy-coral' : 'border-slate-200 bg-white'}`}>
            {t('online_only', { defaultValue: 'Online' })}
          </button>
          <button type="button" onClick={() => setShowLanguages((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" />
            {selectedLanguage ? getLanguageName(selectedLanguage) : t('language', { defaultValue: 'Language' })}
          </button>
        </div>
        {showLanguages && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setSelectedLanguage('')} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm">
              {t('all_languages', { defaultValue: 'All languages' })}
            </button>
            {languageFilters.map((language) => (
              <button key={language.code} type="button" onClick={() => setSelectedLanguage(language.code)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${selectedLanguage === language.code ? 'border-teal-200 bg-teal-50 text-heybuddy-coral' : 'border-slate-200'}`}>
                {language.flag || getLanguageFlag(language.code)} {getLanguageName(language.code)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-heybuddy-medium-gray">
          {t('loading', { defaultValue: 'Loading...' })}
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <UserPlus className="mx-auto h-7 w-7 text-heybuddy-medium-gray" />
          <p className="mt-3 text-sm text-heybuddy-medium-gray">{t('no_souls_found', { defaultValue: 'No people found' })}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {visibleUsers.map((target) => {
            const isFavorite = favoriteNames.has(target.username);
            const isRecent = recentNames.has(target.username);
            const isOnline = onlineUsers.has(target.username);
            return (
              <div key={target.username} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                <button type="button" onClick={() => navigate(`/chat/${target.username}`)} className="relative shrink-0">
                  <img
                    src={resolveProfilePictureUrl(target.profile_picture_url)}
                    alt={target.username}
                    className="h-11 w-11 rounded-full object-cover"
                    onError={(event) => { event.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                  />
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </button>
                <button type="button" onClick={() => navigate(`/chat/${target.username}`)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-heybuddy-dark-gray">{target.username}</p>
                    {isFavorite && <Heart className="h-3.5 w-3.5 fill-current text-heybuddy-coral" />}
                    {isRecent && <span className="text-xs text-heybuddy-medium-gray">{t('recent', { defaultValue: 'Recent' })}</span>}
                  </div>
                  <p className="text-xs text-heybuddy-medium-gray">
                    {isOnline ? t('online') : t('offline')} · {getLanguageFlag(target.language)} {getLanguageName(target.language)}
                  </p>
                </button>
                <button type="button" onClick={() => toggleFavorite(target)} className={`rounded-lg p-2 ${isFavorite ? 'text-heybuddy-coral' : 'text-heybuddy-medium-gray hover:bg-slate-100'}`} aria-label={isFavorite ? t('remove_friend', { defaultValue: 'Remove friend' }) : t('add_friend', { defaultValue: 'Add friend' })}>
                  <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={() => navigate(`/chat/${target.username}`)} className="rounded-lg p-2 text-heybuddy-coral hover:bg-teal-50" aria-label={t('send_message')}>
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Users;
