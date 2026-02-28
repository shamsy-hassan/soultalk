import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { getChatPartners } from './api';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Chats = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="surface-panel p-6 text-center">
        <h2 className="text-xl font-semibold text-soultalk-dark-gray">{t('your_chats')}</h2>
        <p className="text-sm text-soultalk-medium-gray mt-2">{t('no_chats_yet_hint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel p-5">
        <h1 className="text-2xl font-bold tracking-tight text-soultalk-dark-gray">{t('your_chats')}</h1>
        <p className="text-sm text-soultalk-medium-gray mt-1">{t('only_people_you_messaged')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {chats.map((partner) => (
          <button
            key={partner.id || partner.username}
            type="button"
            onClick={() => navigate(`/chat/${partner.username}`)}
            className="card p-4 rounded-2xl text-left hover:border-soultalk-lavender hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={resolveProfilePictureUrl(partner.profile_picture_url)}
                  alt={partner.username}
                  className="w-11 h-11 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-soultalk-dark-gray truncate">{partner.username}</p>
                  <p className="text-xs text-soultalk-medium-gray truncate">{partner.last_message_at || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${partner.online ? 'bg-soultalk-coral' : 'bg-gray-300'}`}></span>
                <span className={`text-xs font-medium ${partner.online ? 'text-soultalk-coral' : 'text-soultalk-medium-gray'}`}>
                  {partner.online ? t('online') : t('offline')}
                </span>
                <MessageSquare className="w-4 h-4 text-soultalk-medium-gray" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chats;
