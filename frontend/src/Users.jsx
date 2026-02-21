import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Globe, Wifi, WifiOff, MessageSquare, UserPlus, Heart } from 'lucide-react'; // Import Heart icon
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';
import EmptyChatState from './EmptyChatState'; // Import EmptyChatState

const Users = ({ user, socket }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  // Temporary state for filter (will be implemented later)
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('All Languages');

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
    u.username.toLowerCase().includes(search.toLowerCase()) && 
    (selectedLanguageFilter === 'All Languages' || u.language === selectedLanguageFilter)
  );

  const getLanguageNameAndFlag = (code) => {
    const name = getLanguageName(code);
    const flag = getLanguageFlag(code);
    return `${name} ${flag}`;
  };

  const startChat = (targetUser) => {
    navigate(`/chat/${targetUser.username}`);
  };

  // Conditional rendering for EmptyChatState
  if (!loading && filteredUsers.length === 0 && search === '') {
    return <EmptyChatState />;
  }

  return (
    <div className="flex flex-col h-full p-4"> {/* Full height to allow scrolling */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-soultalk-dark-gray mb-2">{t('find_souls')}</h1>
        <p className="text-soultalk-medium-gray text-sm">
          {t('connect_with_people_description')}
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soultalk-medium-gray w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_souls_placeholder')}
          className="input-field pl-10 bg-soultalk-white" // Card background is warm-gray, input field inside it should be white
        />
      </div>

      {/* Filter Chips - Placeholder */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['All Languages', 'en', 'es', 'fr', 'am', 'sw'].map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguageFilter(lang)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedLanguageFilter === lang
                ? 'bg-soultalk-lavender text-soultalk-white'
                : 'bg-soultalk-warm-gray text-soultalk-medium-gray hover:bg-gray-200'
            }`}
          >
            {lang === 'All Languages' ? t('all_languages') : getLanguageFlag(lang)} {lang !== 'All Languages' && getLanguageName(lang)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soultalk-lavender"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 -mr-2"> {/* Custom scrollbar area */}
          <div className="grid grid-cols-1 gap-3">
            {filteredUsers.map((targetUser) => (
              <div
                key={targetUser.id}
                className="group card p-3 hover:border-soultalk-lavender hover:shadow-md transition-all duration-300 cursor-pointer" // card already has warm-gray bg
                onClick={() => startChat(targetUser)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-soultalk-coral to-soultalk-teal rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-soultalk-white">
                          {targetUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
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
                    <div>
                      <h4 className="font-semibold text-soultalk-dark-gray">{targetUser.username}</h4>
                      <p className="text-xs text-soultalk-medium-gray">
                        {t('speaks')}: {getLanguageNameAndFlag(targetUser.language)}
                      </p>
                      {/* Learning language placeholder */}
                      <p className="text-xs text-soultalk-medium-gray">
                        {t('learning')}: {getLanguageNameAndFlag('en')} {/* Placeholder */}
                      </p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-soultalk-medium-gray group-hover:text-soultalk-coral transition-colors" />
                </div>
                {/* Bio snippet placeholder */}
                <p className="text-sm text-soultalk-medium-gray mt-2 line-clamp-2">
                  {t('bio_snippet_placeholder')}
                </p>
                <button className="btn-primary btn-sm w-full mt-3">
                  {t('connect')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Random Soul Button */}
      <button className="btn-secondary w-full mt-4">
        {t('random_soul')}
      </button>

      {!loading && filteredUsers.length === 0 && search !== '' && ( // Only show if no users found WITH a search term
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-soultalk-warm-gray rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-soultalk-medium-gray" />
          </div>
          <h4 className="text-lg font-medium text-soultalk-dark-gray mb-2">{t('no_souls_found')}</h4>
          <p className="text-soultalk-medium-gray text-sm">
            {search ? t('try_different_search_term') : t('no_other_souls_available')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;