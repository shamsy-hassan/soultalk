import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Globe, Wifi, WifiOff, MessageSquare, UserPlus, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Users = ({ user, socket, onLogout }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    
    if (socket) {
      socket.emit('get_online_users', (initialOnlineUsers) => {
        setOnlineUsers(new Set(initialOnlineUsers));
      });

      const handleUserStatus = (data) => {
        setOnlineUsers(prev => {
          const newOnline = new Set(prev);
          if (data.online) {
            newOnline.add(data.username);
          } else {
            newOnline.delete(data.username);
          }
          return newOnline;
        });
      };

      socket.on('user_status', handleUserStatus);

      return () => {
        socket.off('user_status', handleUserStatus);
      };
    }
  }, [socket]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        params: { current_user: user.username }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getLanguageName = (code) => {
    const languageMap = {
      en: 'English', sw: 'Swahili', am: 'Amharic', fr: 'French', 
      ar: 'Arabic', es: 'Spanish', pt: 'Portuguese', yo: 'Yoruba', 
      ha: 'Hausa', zu: 'Zulu'
    };
    return languageMap[code] || code;
  };
  
  const startChat = (targetUser) => {
    navigate(`/chat/${targetUser.username}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('welcome')}, {user.username}!</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('find_friends_to_chat_with')}
          </p>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <LogOut className="w-5 h-5 text-gray-600"/>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_users_placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((targetUser) => (
            <div
              key={targetUser.id}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => startChat(targetUser)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-600">
                        {targetUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {onlineUsers.has(targetUser.username) ? (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{targetUser.username}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{getLanguageName(targetUser.language)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {onlineUsers.has(targetUser.username) ? (
                     <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <Wifi className="w-3 h-3" />
                        <span>{t('online')}</span>
                      </div>
                  ) : (
                     <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <WifiOff className="w-3 h-3" />
                        <span>{t('offline')}</span>
                      </div>
                  )}
                  <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">{t('no_users_found')}</h4>
          <p className="text-gray-500">
            {search ? t('try_different_search_term') : t('no_other_users_available')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;