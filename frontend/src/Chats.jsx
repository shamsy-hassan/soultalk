import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronRight, Sparkles, Search, UsersRound, Filter, X } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soultalk-lavender"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="hero-panel p-6 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-soultalk-gradient-start/15 to-soultalk-gradient-end/15 ring-1 ring-black/5">
          <MessageSquare className="h-6 w-6 text-soultalk-medium-gray" />
        </div>
        <h2 className="text-xl font-semibold text-soultalk-dark-gray dark:text-soultalk-white">
          {t('your_chats')}
        </h2>
        <p className="text-sm text-soultalk-medium-gray mt-2 dark:text-gray-400">
          {t('no_chats_yet_hint')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end px-4 py-2 text-sm font-semibold text-white st-white-visible shadow-sm hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender dark:focus:ring-offset-[#0f172a]"
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
      <div className="hero-panel p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title">{t('your_chats')}</h1>
            <p className="text-sm text-soultalk-medium-gray mt-1 dark:text-gray-400">
              {t('only_people_you_messaged')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-950/35 px-3 py-1.5 text-xs font-medium text-soultalk-medium-gray shadow-sm ring-1 ring-white/10 backdrop-blur">
              <Sparkles className="h-4 w-4 text-soultalk-lavender" />
              <span>
                {t('unread_messages', { defaultValue: 'Unread' })}: {totalUnread}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="inline-flex items-center gap-2 rounded-full bg-soultalk-warm-gray/70 px-3 py-1.5 text-xs font-semibold text-soultalk-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              <UsersRound className="h-4 w-4 text-soultalk-lavender" />
              {t('discover_souls')}
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
              {t('search', { defaultValue: 'Search' })}
              <div className="relative mt-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-soultalk-medium-gray dark:text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder={t('search_chats_placeholder', { defaultValue: 'Search chats by username…' })}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-soultalk-warm-gray dark:hover:bg-white/10"
                    aria-label={t('clear_search', { defaultValue: 'Clear search' })}
                  >
                    <X className="h-4 w-4 text-soultalk-medium-gray dark:text-gray-300" />
                  </button>
                )}
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly((v) => !v)}
            className={`text-left p-4 rounded-2xl border transition-colors ${
              unreadOnly
                ? 'bg-emerald-500/10 border-emerald-400/25'
                : 'bg-soultalk-warm-gray border-emerald-400/15 hover:bg-emerald-500/10'
            }`}
          >
            <p className="font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
              <Filter className="w-4 h-4 text-soultalk-lavender" />
              {t('unread_only', { defaultValue: 'Unread only' })}
            </p>
            <p className="text-sm text-soultalk-medium-gray mt-1">
              {t('unread_only_desc', { defaultValue: 'Show chats that need your attention.' })}
            </p>
          </button>
        </div>

        <div className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-soultalk-medium-gray">
          {t('chats_help', { defaultValue: 'Tip: Unread chats are shown first. The dot shows if a soul is currently online.' })}
        </div>
      </div>

      {visibleChats.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-soultalk-warm-gray rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-soultalk-medium-gray" />
          </div>
          <h4 className="text-lg font-medium text-soultalk-dark-gray mb-2 dark:text-gray-100">
            {t('no_chats_found', { defaultValue: 'No chats found' })}
          </h4>
          <p className="text-soultalk-medium-gray text-sm dark:text-gray-400">
            {t('try_different_search_term')}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setUnreadOnly(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-soultalk-warm-gray px-4 py-2 text-sm font-semibold text-soultalk-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              <X className="w-4 h-4" />
              {t('reset', { defaultValue: 'Reset' })}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end px-4 py-2 text-sm font-semibold text-white st-white-visible shadow-sm hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90"
            >
              {t('discover_souls')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleChats.map((partner) => {
          const unreadCount = unreadByUser[partner.username] || 0;
          const hasUnread = unreadCount > 0;

          return (
          <button
            key={partner.id || partner.username}
            type="button"
            onClick={() => navigate(`/chat/${partner.username}`)}
            aria-label={t('chat_with_username', { username: partner.username, defaultValue: `Chat with ${partner.username}` })}
            className={`group card-elevated p-4 rounded-2xl text-left hover:border-soultalk-lavender hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender dark:focus:ring-offset-[#0f172a] ${
              hasUnread ? 'border-soultalk-coral/60 bg-soultalk-coral/5 dark:bg-soultalk-coral/10' : ''
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
                  <p className="font-semibold text-soultalk-dark-gray truncate dark:text-gray-100">{partner.username}</p>
                  <p className={`text-xs truncate ${hasUnread ? 'text-soultalk-coral font-semibold' : 'text-soultalk-medium-gray dark:text-gray-400'}`}>
                    {partner.last_message || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-soultalk-coral text-soultalk-white st-white-visible text-[11px] font-semibold inline-flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span className={`w-2 h-2 rounded-full ${partner.online ? 'bg-soultalk-coral' : 'bg-gray-300'}`}></span>
                <span className={`text-xs font-medium ${partner.online ? 'text-soultalk-coral' : 'text-soultalk-medium-gray'}`}>
                  {partner.online ? t('online') : t('offline')}
                </span>
                <ChevronRight className="w-4 h-4 text-soultalk-medium-gray group-hover:translate-x-0.5 transition-transform dark:text-gray-400" />
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
