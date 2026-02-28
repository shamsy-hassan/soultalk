import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageFlag } from './i18n';
import UserMenu from './UserMenu'; // Import the new UserMenu component
import { Users as UsersIcon, MessageSquare, Heart } from 'lucide-react'; // Import Users, MessageSquare, Heart icons
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; // Import NavLink and useNavigate
import axios from 'axios'; // Import axios
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const Sidebar = ({ user, socket, onLogout, onChangeLanguage, onNavigateToProfileSetup }) => { 
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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

      socket.on('receive_message', (data) => {
        const activeChatUser = location.pathname.startsWith('/chat/')
          ? decodeURIComponent(location.pathname.split('/chat/')[1] || '')
          : null;

        if (!data?.from || data.from === activeChatUser) {
          return;
        }

        setUnreadCounts((prev) => ({
          ...prev,
          [data.from]: (prev[data.from] || 0) + 1
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('user_status');
        socket.off('receive_message');
      }
    };
  }, [socket, location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith('/chat/')) return;
    const activeChatUser = decodeURIComponent(location.pathname.split('/chat/')[1] || '');
    if (!activeChatUser) return;

    setUnreadCounts((prev) => ({
      ...prev,
      [activeChatUser]: 0
    }));
  }, [location.pathname]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        params: { current_user: user.username }
      });
      setUsers(response.data.users);
      
      const online = response.data.users
        .filter(u => u.online)
        .map(u => u.username);
      setOnlineUsers(online);
    } catch (error) {
      console.error('Error fetching users for sidebar:', error);
    }
  };

  const startChat = (targetUser) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [targetUser.username]: 0
    }));
    navigate(`/chat/${targetUser.username}`);
  };

  return (
    <div className="w-[300px] bg-soultalk-white border-r border-gray-100 flex flex-col h-screen p-4 shadow-lg">
      {/* User Profile at top */}
      {user && (
        <UserMenu 
          user={user} 
          onLogout={onLogout} 
          onChangeLanguage={onChangeLanguage}
          onNavigateToProfileSetup={onNavigateToProfileSetup}
        />
      )}

      {/* "Find Souls" navigation button */}
      <NavLink
        to="/users"
        className={({ isActive }) =>
          `btn-primary w-full mb-6 flex items-center justify-center space-x-2 ${
            isActive ? 'bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
          }`
        }
      >
        <UsersIcon className="w-5 h-5" />
        <span>{t('find_souls')}</span>
      </NavLink>

      {/* Simplified User List / Conversations */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2"> {/* Custom scrollbar area */}
        <h3 className="text-lg font-semibold text-soultalk-dark-gray mb-4">{t('conversations')}</h3>
        <div className="space-y-3">
          {users.length > 0 ? (
            users.map((targetUser) => {
              const targetUserAvatarUrl = resolveProfilePictureUrl(targetUser.profile_picture_url);
              return (
              <div
                key={targetUser.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-soultalk-warm-gray transition-colors cursor-pointer"
                onClick={() => startChat(targetUser)}
              >
                <div className="relative">
                  <img
                    src={targetUserAvatarUrl}
                    alt={targetUser.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                  />
                  {onlineUsers.includes(targetUser.username) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 text-soultalk-coral animate-pulse" title="Connected soul">
                      <Heart className="w-full h-full fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-soultalk-dark-gray">{targetUser.username}</p>
                  {unreadCounts[targetUser.username] > 0 ? (
                    <p className="text-xs text-soultalk-coral font-medium">
                      {unreadCounts[targetUser.username]} new message{unreadCounts[targetUser.username] > 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-soultalk-medium-gray">{t('online')}</p>
                  )}
                </div>
                <MessageSquare className="w-5 h-5 text-soultalk-medium-gray" />
              </div>
              );
            })
          ) : (
            <p className="text-soultalk-medium-gray text-sm text-center">{t('no_conversations_yet')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
