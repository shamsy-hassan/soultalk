import React, { useEffect, useState } from 'react';
import { Heart, MessageSquare, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFavorites, setFavorite } from './api';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Friends = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFavorites(user.username)
      .then((data) => {
        if (!cancelled) setFriends(Array.isArray(data?.favorites) ? data.favorites : []);
      })
      .catch((error) => console.error('Failed to load friends:', error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user.username]);

  const visibleFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(query.trim().toLowerCase())
  );

  const removeFriend = async (friend) => {
    try {
      await setFavorite(user.username, friend.username, false);
      setFriends((current) => current.filter((item) => item.username !== friend.username));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="section-title">{t('friends', { defaultValue: 'Friends' })}</h1>
        <p className="mt-1 text-sm text-heybuddy-medium-gray">
          {t('friends_subtitle', { defaultValue: 'Your saved contacts.' })}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-heybuddy-medium-gray" />
        <input
          className="input-field pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search_friends', { defaultValue: 'Search friends' })}
          aria-label={t('search_friends', { defaultValue: 'Search friends' })}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-heybuddy-medium-gray">
          {t('loading', { defaultValue: 'Loading...' })}
        </div>
      ) : visibleFriends.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Heart className="mx-auto h-7 w-7 text-heybuddy-medium-gray" />
          <p className="mt-3 font-medium text-heybuddy-dark-gray">
            {t('no_friends_yet', { defaultValue: 'No saved friends yet' })}
          </p>
          <button type="button" onClick={() => navigate('/users')} className="btn-primary mt-4 gap-2">
            <UserPlus className="h-4 w-4" />
            {t('add_friend', { defaultValue: 'Add a friend' })}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {visibleFriends.map((friend) => (
            <div key={friend.username} className="flex items-center gap-3 p-4">
              <img
                src={resolveProfilePictureUrl(friend.profile_picture_url)}
                alt={friend.username}
                className="h-11 w-11 rounded-full object-cover"
                onError={(event) => { event.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
              />
              <button type="button" onClick={() => navigate(`/chat/${friend.username}`)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold text-heybuddy-dark-gray">{friend.username}</p>
                <p className="text-xs text-heybuddy-medium-gray">
                  {friend.online ? t('online') : t('offline')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/chat/${friend.username}`)}
                className="rounded-lg p-2 text-heybuddy-coral hover:bg-teal-50"
                aria-label={t('send_message')}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeFriend(friend)}
                className="rounded-lg p-2 text-heybuddy-medium-gray hover:bg-slate-100"
                aria-label={t('remove_friend', { defaultValue: 'Remove friend' })}
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
