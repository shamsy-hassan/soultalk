import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Globe, Wifi, WifiOff, MessageSquare, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Users = ({ user, socket }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

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

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        params: { current_user: user.username }
      });
      setUsers(response.data.users);
      
      // Initialize online users
      const online = response.data.users
        .filter(u => u.online)
        .map(u => u.username);
      setOnlineUsers(online);
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
    const languages = {
      'en': t('language_english'),
      'sw': t('language_swahili'),
      'am': t('language_amharic'),
      'fr': t('language_french'),
      'ar': t('language_arabic'),
      'es': t('language_spanish'),
      'pt': t('language_portuguese'),
      'yo': t('language_yoruba'),
      'ha': t('language_hausa'),
      'zu': t('language_zulu')
    };
    return languages[code] || code;
  };

  const startChat = (targetUser) => {
    navigate(`/chat/${targetUser.username}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('find_friends_to_chat_with')}</h1>
        <p className="text-gray-600">
          {t('connect_with_people_description')}
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('active_users')}</h3>
              <p className="text-sm text-gray-600">{t('connect_with_people_world')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{onlineUsers.length} {t('online')}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">{users.length - onlineUsers.length} {t('offline')}</span>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_users_placeholder')}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((targetUser) => (
              <div
                key={targetUser.id}
                className="group border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => startChat(targetUser)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">
                          {targetUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {onlineUsers.includes(targetUser.username) ? (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{targetUser.username}</h4>
                      <div className="flex items-center space-x-1">
                        {onlineUsers.includes(targetUser.username) ? (
                          <>
                            <Wifi className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{t('online')}</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{t('offline')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{t('speaks')}:</span>
                    </div>
                    <span className="font-medium">{getLanguageName(targetUser.language)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('you_speak')}:</span>
                    <span className="font-medium">{getLanguageName(user.language)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span className="font-medium">{t('example')}:</span> 
                    <div className="mt-1">
                      <div className="text-purple-600">{t('you')}: {t('hello')}</div>
                      <div className="text-gray-700">
                        {targetUser.username} {t('sees')}: {targetUser.language === 'sw' ? 'Hujambo' : 
                                                   targetUser.language === 'am' ? 'ሰላም' : 
                                                   targetUser.language === 'fr' ? 'Bonjour' : t('hello')}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('start_chat')}</span>
                </button>
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

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <Wifi className="w-4 h-4 text-green-600" />
          </div>
          <span>{t('live_connection_status')}</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('your_status')}</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-600">{t('connected')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('websocket')}</span>
            <span className={`font-medium ${socket ? 'text-green-600' : 'text-red-600'}`}>
              {socket ? t('live') : t('disconnected')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('active_users_count')}</span>
            <span className="font-medium text-purple-600">{onlineUsers.length} {t('online_now')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;