import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MessageSquare, UserPlus, Heart } from 'lucide-react'; // Import Heart icon
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';
import EmptyChatState from './EmptyChatState'; // Import EmptyChatState
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { getLanguages } from './api';
import { countryCodes } from './countryCodes';

const Users = ({ user, socket }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  // Temporary state for filter (will be implemented later)
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState(null);
  const [languageFilters, setLanguageFilters] = useState([]);
  const [showLanguageFilters, setShowLanguageFilters] = useState(false);

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

  useEffect(() => {
    const loadLanguageFilters = async () => {
      try {
        const data = await getLanguages();
        setLanguageFilters(data.languages || []);
      } catch (error) {
        console.error('Error fetching language filters:', error);
      }
    };

    loadLanguageFilters();
  }, []);

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
    (!selectedLanguageFilter || u.language === selectedLanguageFilter)
  );

  const getLanguageNameAndFlag = (code) => {
    const name = getLanguageName(code);
    const flag = getLanguageFlag(code);
    return `${name} ${flag}`;
  };

  const getCountryFromPhone = (phone) => {
    if (!phone) {
      return 'Unknown';
    }

    const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
    const matchedCountry = sortedCountryCodes.find((country) => phone.startsWith(country.code));
    return matchedCountry ? matchedCountry.name : 'Unknown';
  };

  const startChat = (targetUser) => {
    navigate(`/chat/${targetUser.username}`);
  };

  // Conditional rendering for EmptyChatState
  if (!loading && filteredUsers.length === 0 && search === '') {
    return <EmptyChatState />;
  }

  return (
    <div className="flex flex-col h-full"> {/* Full height to allow scrolling */}
      <div className="mb-5 hero-panel p-4 md:p-6">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-soultalk-lavender/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-soultalk-coral/15 blur-2xl" />
        <h1 className="section-title mb-2 relative">{t('find_souls')}</h1>
        <p className="text-soultalk-medium-gray text-sm">
          {t('connect_with_people_description')}
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-soultalk-medium-gray w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_souls_placeholder')}
          className="input-field pl-11 bg-soultalk-white/95 shadow-sm border-gray-200 focus:shadow-md"
        />
      </div>

      {/* Filter Chips - Placeholder */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            if (showLanguageFilters) {
              setShowLanguageFilters(false);
              setSelectedLanguageFilter(null);
            } else {
              setShowLanguageFilters(true);
            }
          }}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors border ${
            !selectedLanguageFilter
              ? 'bg-soultalk-lavender text-soultalk-white border-soultalk-lavender'
              : 'bg-soultalk-warm-gray text-soultalk-medium-gray hover:bg-gray-200 border-gray-200'
          }`}
        >
          {t('all_languages')}
        </button>

        {showLanguageFilters && languageFilters.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguageFilter(lang.code)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors border ${
              selectedLanguageFilter === lang.code
                ? 'bg-soultalk-lavender text-soultalk-white border-soultalk-lavender'
                : 'bg-soultalk-warm-gray text-soultalk-medium-gray hover:bg-gray-200 border-gray-200'
            }`}
          >
            {lang.flag || getLanguageFlag(lang.code)} {getLanguageName(lang.code)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soultalk-lavender"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto subtle-scrollbar pr-2 -mr-2"> {/* Custom scrollbar area */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredUsers.map((targetUser) => {
              const targetUserAvatarUrl = resolveProfilePictureUrl(targetUser.profile_picture_url);
              return (
              <div
                key={targetUser.id}
                className="group card-elevated p-4 rounded-3xl hover:border-soultalk-lavender hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col"
                onClick={() => startChat(targetUser)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={targetUserAvatarUrl}
                        alt={targetUser.username}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                      />
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
                    <div className="min-w-0">
                      <h4 className="font-semibold text-soultalk-dark-gray tracking-tight">{targetUser.username}</h4>
                      <p className={`text-xs font-medium ${onlineUsers.includes(targetUser.username) ? 'text-soultalk-coral' : 'text-soultalk-medium-gray'}`}>
                        {onlineUsers.includes(targetUser.username) ? t('online') : t('offline')}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray truncate">
                        {t('speaks')}: {getLanguageNameAndFlag(targetUser.language)}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray truncate">
                        {t('country')}: {getCountryFromPhone(targetUser.phone)}
                      </p>
                      <p className="text-xs text-soultalk-medium-gray line-clamp-2 leading-relaxed">
                        {t('about')}: {targetUser.bio || targetUser.about || t('no_bio_yet')}
                      </p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-soultalk-medium-gray group-hover:text-soultalk-coral transition-colors" />
                </div>
                <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-semibold py-2.5 px-4 hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 transition-all duration-300 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                  {t('connect')}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

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
