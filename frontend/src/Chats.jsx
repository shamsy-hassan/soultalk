import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronRight, Search, UsersRound, Filter, X } from 'lucide-react';
import { getChatPartners } from './api';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Chats = ({ user, unreadByUser = {} }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const totalUnread = Object.values(unreadByUser).reduce((sum, value) => sum + (Number(value) || 0), 0);

  useEffect(() => {
    const loadChats = async () => {
      if (!user?.username) return;
      try {
        const data = await getChatPartners(user.username);
        setChats(data.chats || []);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user?.username]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heybuddy-lavender"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="hero-panel p-6 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-heybuddy-gradient-start/15 to-heybuddy-gradient-end/15 ring-1 ring-black/5">
          <MessageSquare className="h-6 w-6 text-heybuddy-medium-gray" />
        </div>
        <h2 className="text-xl font-semibold text-heybuddy-dark-gray dark:text-heybuddy-white">
          {t('your_chats')}
        </h2>
        <p className="text-sm text-heybuddy-medium-gray mt-2 dark:text-gray-400">
          {t('no_chats_yet_hint')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-heybuddy-gradient-start to-heybuddy-gradient-end px-4 py-2 text-sm font-semibold text-white st-white-visible shadow-sm hover:from-heybuddy-gradient-start/90 hover:to-heybuddy-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-heybuddy-lavender dark:focus:ring-offset-[#0f172a]"
        >
          {t('discover_souls')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const sortedChats = [...chats]
    .map((partner, index) => ({ partner, index }))
    .sort((a, b) => {
      const aUnread = unreadByUser[a.partner.username] || 0;
      const bUnread = unreadByUser[b.partner.username] || 0;
      if (aUnread > 0 && bUnread === 0) return -1;
      if (bUnread > 0 && aUnread === 0) return 1;
      return a.index - b.index;
    })
    .map(({ partner }) => partner);

  const visibleChats = sortedChats.filter((partner) => {
    const unreadCount = unreadByUser[partner.username] || 0;
    if (unreadOnly && unreadCount <= 0) return false;
    if (!query.trim()) return true;
    return partner.username?.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title">{t('your_chats')}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <span className="text-sm text-heybuddy-medium-gray">{t('unread_messages')}: {totalUnread}</span>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-heybuddy-dark-gray hover:bg-slate-50 transition-colors"
            >
              <UsersRound className="h-4 w-4 text-heybuddy-lavender" />
              {t('discover_souls')}
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-heybuddy-medium-gray dark:text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder={t('search_chats_placeholder')}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-heybuddy-warm-gray dark:hover:bg-white/10"
                    aria-label={t('clear_search')}
                  >
                    <X className="h-4 w-4 text-heybuddy-medium-gray dark:text-gray-300" />
                  </button>
                )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              unreadOnly
                ? 'bg-teal-50 border-teal-200 text-heybuddy-coral'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-semibold text-heybuddy-dark-gray inline-flex items-center gap-2">
              <Filter className="w-4 h-4 text-heybuddy-lavender" />
              {t('unread_only')}
            </span>
          </button>
        </div>
      </div>

      {visibleChats.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-heybuddy-warm-gray rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-heybuddy-medium-gray" />
          </div>
          <h4 className="text-lg font-medium text-heybuddy-dark-gray mb-2 dark:text-gray-100">
            {t('no_chats_found')}
          </h4>
          <p className="text-heybuddy-medium-gray text-sm dark:text-gray-400">
            {t('try_different_search_term')}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setUnreadOnly(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-heybuddy-warm-gray px-4 py-2 text-sm font-semibold text-heybuddy-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              <X className="w-4 h-4" />
              {t('reset')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-heybuddy-gradient-start to-heybuddy-gradient-end px-4 py-2 text-sm font-semibold text-white st-white-visible shadow-sm hover:from-heybuddy-gradient-start/90 hover:to-heybuddy-gradient-end/90"
            >
              {t('discover_souls')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {visibleChats.map((partner) => {
          const unreadCount = unreadByUser[partner.username] || 0;
          const hasUnread = unreadCount > 0;

          return (
          <button
            key={partner.id || partner.username}
            type="button"
            onClick={() => navigate(`/chat/${partner.username}`)}
            aria-label={t('chat_with_username', { username: partner.username })}
            className={`group w-full p-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-heybuddy-lavender ${
              hasUnread ? 'bg-teal-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={resolveProfilePictureUrl(partner.profile_picture_url)}
                  alt={partner.username}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-heybuddy-dark-gray truncate dark:text-gray-100">{partner.username}</p>
                  <p className={`text-xs truncate ${hasUnread ? 'text-heybuddy-coral font-semibold' : 'text-heybuddy-medium-gray dark:text-gray-400'}`}>
                    {partner.last_message || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-heybuddy-coral text-heybuddy-white st-white-visible text-[11px] font-semibold inline-flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span className={`w-2 h-2 rounded-full ${partner.online ? 'bg-heybuddy-coral' : 'bg-gray-300'}`}></span>
                <span className={`text-xs font-medium ${partner.online ? 'text-heybuddy-coral' : 'text-heybuddy-medium-gray'}`}>
                  {partner.online ? t('online') : t('offline')}
                </span>
                <ChevronRight className="w-4 h-4 text-heybuddy-medium-gray group-hover:translate-x-0.5 transition-transform dark:text-gray-400" />
              </div>
            </div>
          </button>
        )})}
        </div>
      )}
    </div>
  );
};

export default Chats;
