import React, { useEffect, useState } from 'react';
import UserMenu from './UserMenu';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users as UsersIcon, MessageSquare, Settings, ShieldCheck, MessageSquareText } from 'lucide-react';
import { getChatPartners } from './api';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Sidebar = ({ user, socket, onLogout, onChangeLanguage, onNavigateToProfileSetup, unreadCount = 0 }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [chatPartners, setChatPartners] = useState([]);
  const visibleChatPartners = chatPartners.slice(0, 6);
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-soultalk-lavender text-emerald-50'
        : 'text-soultalk-dark-gray hover:bg-soultalk-warm-gray'
    }`;

  useEffect(() => {
    const loadChats = async () => {
      if (!user?.username) return;
      try {
        const data = await getChatPartners(user.username);
        setChatPartners(Array.isArray(data?.chats) ? data.chats : []);
      } catch (error) {
        console.error('Failed to load sidebar chats:', error);
      }
    };

    loadChats();
  }, [user?.username]);

  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = (data) => {
      if (!data?.username) return;
      setChatPartners((prev) =>
        prev.map((partner) =>
          partner.username === data.username ? { ...partner, online: Boolean(data.online) } : partner
        )
      );
    };

    const bumpPartnerToTop = (username, updates) => {
      setChatPartners((prev) => {
        const index = prev.findIndex((p) => p.username === username);
        if (index === -1) return prev;
        const updated = { ...prev[index], ...updates };
        const next = prev.slice();
        next.splice(index, 1);
        next.unshift(updated);
        return next;
      });
    };

    const handleReceiveMessage = (payload) => {
      if (!payload?.from || payload?.to !== user?.username) return;
      bumpPartnerToTop(payload.from, {
        last_message: payload.message || payload.originalMessage || '',
        last_message_at: new Date().toISOString(),
      });
    };

    const handleMessageSent = (payload) => {
      if (!payload?.to || payload?.from !== user?.username) return;
      bumpPartnerToTop(payload.to, {
        last_message: payload.message || '',
        last_message_at: new Date().toISOString(),
      });
    };

    socket.on('user_status', handleUserStatus);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('user_status', handleUserStatus);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, user?.username]);

  return (
    <aside
      className="w-full max-w-[300px] backdrop-blur-sm border-r flex flex-col h-[100dvh] p-4 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.65)] safe-pt safe-pb safe-px bg-soultalk-white/95 border-emerald-400/15 min-h-0"
    >
      {user && (
        <UserMenu
          user={user}
          onLogout={onLogout}
          onChangeLanguage={onChangeLanguage}
          onNavigateToProfileSetup={onNavigateToProfileSetup}
        />
      )}

      <div className="space-y-1">
        <NavLink to="/users" className={navItemClass}>
          <UsersIcon className="w-4 h-4" />
          {t('discover_souls')}
        </NavLink>
        <NavLink to="/chats" className={navItemClass}>
          <span className="relative">
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-soultalk-coral text-emerald-50 text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
          {t('your_chats')}
        </NavLink>
      </div>

      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-soultalk-medium-gray">{t('your_chats')}</p>
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className="text-xs font-semibold text-soultalk-lavender hover:underline"
          >
            {t('view_all', { defaultValue: 'View all' })}
          </button>
        </div>
        <div className="mt-2 space-y-1 overflow-hidden pr-1">
          {visibleChatPartners.length === 0 ? (
            <p className="text-xs text-soultalk-medium-gray px-2 py-2">
              {t('no_chats_yet_hint')}
            </p>
          ) : (
            visibleChatPartners.map((partner) => (
              <button
                key={partner.id || partner.username}
                type="button"
                onClick={() => navigate(`/chat/${partner.username}`)}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-soultalk-warm-gray transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <img
                    src={resolveProfilePictureUrl(partner.profile_picture_url)}
                    alt={partner.username}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-black/5"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL;
                    }}
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-soultalk-white ${
                      partner.online ? 'bg-soultalk-coral' : 'bg-gray-300'
                    }`}
                    aria-label={partner.online ? t('online') : t('offline')}
                    title={partner.online ? t('online') : t('offline')}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <p className="text-sm font-semibold text-soultalk-dark-gray truncate">{partner.username}</p>
                    <span className={`text-[11px] font-medium ${partner.online ? 'text-soultalk-coral' : 'text-soultalk-medium-gray'}`}>
                      {partner.online ? t('online') : t('offline')}
                    </span>
                  </div>
                  <p className="text-xs text-soultalk-medium-gray truncate">
                    {partner.last_message || ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-emerald-400/15">
        <p className="text-xs uppercase tracking-wide mb-2 text-soultalk-medium-gray">{t('system')}</p>
        <div className="space-y-1">
          <NavLink to="/settings" className={navItemClass}>
            <Settings className="w-4 h-4" />
            {t('settings')}
          </NavLink>
          <NavLink to="/privacy" className={navItemClass}>
            <ShieldCheck className="w-4 h-4" />
            {t('privacy_policy')}
          </NavLink>
          <NavLink to="/feedback" className={navItemClass}>
            <MessageSquareText className="w-4 h-4" />
            {t('send_feedback')}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
