import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, NavLink } from 'react-router-dom'; // Added useNavigate
import Login from './Login';
import Users from './Users';
import Chat from './Chat';
import Chats from './Chats';
import SettingsPage from './Settings';
import PrivacyPolicy from './PrivacyPolicy';
import Feedback from './Feedback';
import Sidebar from './Sidebar'; // Import the new Sidebar component
import { io } from 'socket.io-client';
import './index.css';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { Heart, MessageSquare, Compass, Globe2, Settings, ShieldCheck, MessageSquareText, Sun, Moon, X, Camera } from 'lucide-react'; // Import icons for logo and mobile menu
import ProfileSetup from './ProfileSetup'; // Import ProfileSetup component
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { uploadProfilePicture, updateUserProfile } from './profileAPI';
import { updateUserLanguage } from './api';
import { getLanguageFlag, getLanguageName, resolveUiLanguage } from './i18n';
import { SOCKET_URL } from './config';

function App() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('soultalk_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [socket, setSocket] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false); // State for mobile sidebar
  const [profileSetupError, setProfileSetupError] = useState('');
  const [messageToast, setMessageToast] = useState(null);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('soultalk_theme') || 'light');
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(resolveUiLanguage(user.language));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('soultalk_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });
      setSocket(newSocket);

      newSocket.emit('join', { username: user.username });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingToast = (data) => {
      const sender = data?.from;
      if (!sender) return;

      const activeChatUser = location.pathname.startsWith('/chat/')
        ? decodeURIComponent(location.pathname.replace('/chat/', ''))
        : null;

      // No toast if user is already inside the sender's chat.
      if (activeChatUser === sender) {
        return;
      }

      setMessageToast((prev) => {
        if (prev && prev.from === sender) {
          return { from: sender, count: prev.count + 1 };
        }
        return { from: sender, count: 1 };
      });

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setMessageToast(null);
      }, 3500);
    };

    socket.on('receive_message', handleIncomingToast);
    return () => {
      socket.off('receive_message', handleIncomingToast);
    };
  }, [socket, user, location.pathname]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('soultalk_user', JSON.stringify(userData));
    i18n.changeLanguage(resolveUiLanguage(userData.language));
  };

  const performLogout = () => {
    if (socket) {
      socket.emit('leave', { username: user.username });
      socket.disconnect();
    }
    setUser(null);
    localStorage.removeItem('soultalk_user');
    localStorage.removeItem('i18nextLng');
    i18n.changeLanguage('en');
    setSocket(null);
    setShowLogoutConfirm(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleChangeLanguage = async (newLang) => {
    const username = user?.username;
    if (!username) {
      return;
    }

    i18n.changeLanguage(resolveUiLanguage(newLang));
    setUser(prevUser => {
      const updatedUser = { ...prevUser, language: newLang };
      localStorage.setItem('soultalk_user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    try {
      await updateUserLanguage(username, newLang);
    } catch (error) {
      console.error('Failed to persist language change:', error);
    }
  };

  const handleNavigateToProfileSetup = () => {
    setProfileSetupError('');
    navigate('/profile-setup');
    setShowSidebarMobile(false); // Close sidebar on mobile when navigating
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleProfileSetupComplete = async (croppedImageUrl) => {
    setProfileSetupError('');

    if (!croppedImageUrl || !user) {
      navigate('/users');
      return;
    }

    try {
      const blobResponse = await fetch(croppedImageUrl);
      const imageBlob = await blobResponse.blob();
      const formData = new FormData();
      formData.append('profile_picture', imageBlob, 'profile.jpeg');

      const { res: uploadRes, data: uploadData } = await uploadProfilePicture(formData);
      if (!uploadRes.ok) {
        setProfileSetupError(uploadData.error || 'Failed to upload profile picture.');
        return;
      }

      const { res: updateRes, data: updateData } = await updateUserProfile(
        { phone: user.phone, username: user.username },
        uploadData.profile_picture_url
      );

      if (!updateRes.ok) {
        setProfileSetupError(updateData.error || 'Failed to save profile picture URL.');
        return;
      }

      const updatedUser = { ...user, ...updateData.user };
      setUser(updatedUser);
      localStorage.setItem('soultalk_user', JSON.stringify(updatedUser));
      navigate('/users');
    } catch (error) {
      setProfileSetupError('Error while saving profile picture.');
      console.error('Error while saving profile picture:', error);
    }
  };

  const currentUserAvatarUrl = resolveProfilePictureUrl(user?.profile_picture_url);
  const path = location.pathname;
  const pageTitle = path === '/users'
    ? t('discover_souls')
    : path === '/chats'
      ? t('your_chats')
    : path === '/settings'
      ? t('settings')
    : path === '/privacy'
      ? t('privacy_policy')
    : path === '/feedback'
      ? t('send_feedback')
    : path.startsWith('/chat/')
      ? t('chat_with_username', { username: decodeURIComponent(path.replace('/chat/', '')) })
      : path === '/profile-setup'
        ? t('profile_setup')
        : 'SoulTalk';

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-[#0f172a] text-gray-100' : 'bg-gradient-to-b from-soultalk-white via-soultalk-white to-soultalk-warm-gray/40'}`}>


      {/* Sidebar - Desktop always visible, mobile as drawer */}
      {user && (
        <div className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-[300px] bg-soultalk-white shadow-lg transform ${
            showSidebarMobile ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:shadow-none transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <Sidebar 
            user={user} 
            socket={socket} 
            onLogout={handleLogoutClick} 
            onChangeLanguage={handleChangeLanguage}
            onNavigateToProfileSetup={handleNavigateToProfileSetup}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        </div>
      )}
      {/* Mobile sidebar overlay */}
      {showSidebarMobile && user && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setShowSidebarMobile(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${user ? 'md:ml-[300px]' : ''}`}> {/* Adjust margin for desktop sidebar when user is logged in */}
        {user && (
          <nav className={`${theme === 'dark' ? 'bg-[#111827]/90 border-gray-800' : 'bg-soultalk-white/90 border-gray-100'} backdrop-blur-sm px-3 py-3 sm:px-4 md:px-6 shadow-sm flex items-center justify-between z-20 sticky top-0 border-b safe-pt safe-px`}>
            {/* Left side: App Logo/Name and Mobile Sidebar Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              {/* Mobile Sidebar Toggle - only on small screens */}
              <button
                className="md:hidden p-2 rounded-lg bg-soultalk-warm-gray shadow-md"
                onClick={() => setShowSidebarMobile(!showSidebarMobile)}
                aria-label="Toggle sidebar"
              >
                <MessageSquare className="w-6 h-6 text-soultalk-dark-gray" />
              </button>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-soultalk-coral to-soultalk-teal flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-soultalk-white" />
                </div>
                <div className="min-w-0">
                  <h1 className={`text-lg sm:text-xl font-bold tracking-tight truncate ${theme === 'dark' ? 'text-gray-100' : 'text-soultalk-dark-gray'}`}>SoulTalk</h1>
                  <p className={`text-xs hidden md:block ${theme === 'dark' ? 'text-gray-400' : 'text-soultalk-medium-gray'}`}>{pageTitle}</p>
                </div>
              </div>
            </div>

            {/* Right side: quick links + user context */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <NavLink
                to="/chats"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isActive ? 'bg-soultalk-lavender text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`
                }
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden md:inline">{t('chats')}</span>
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive ? 'bg-soultalk-lavender text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`
                }
              >
                <Compass className="w-4 h-4" />
                {t('explore')}
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive ? 'bg-soultalk-lavender text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </NavLink>
              <NavLink
                to="/privacy"
                className={({ isActive }) =>
                  `hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive ? 'bg-soultalk-lavender text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                {t('privacy')}
              </NavLink>
              <NavLink
                to="/feedback"
                className={({ isActive }) =>
                  `hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive ? 'bg-soultalk-lavender text-soultalk-white' : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`
                }
              >
                <MessageSquareText className="w-4 h-4" />
                {t('feedback')}
              </NavLink>

              <div className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-soultalk-warm-gray text-soultalk-dark-gray text-sm">
                <Globe2 className="w-4 h-4" />
                <span>{getLanguageFlag(user.language)} {getLanguageName(user.language)}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleTheme}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-sm bg-soultalk-warm-gray border border-gray-200 text-soultalk-dark-gray hover:bg-gray-200 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden md:inline">{theme === 'dark' ? t('light') : t('dark')}</span>
              </button>

              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-soultalk-warm-gray">
                <span className="w-2 h-2 rounded-full bg-soultalk-coral animate-pulse"></span>
                <span className="text-xs text-soultalk-medium-gray">{user.username}</span>
              </div>

              <img
                src={currentUserAvatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-soultalk-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowProfilePreview(true)}
                onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
              />
            </div>
          </nav>
        )}

        <main className="flex-1 overflow-y-auto subtle-scrollbar p-3 sm:p-4 md:p-6 safe-px"> {/* Adjusted padding */}
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/users" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/users" 
              element={user ? <Users user={user} socket={socket} /> : <Navigate to="/" />} 
            />
            <Route
              path="/chats"
              element={user ? <Chats user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage theme={theme} onToggleTheme={handleToggleTheme} /> : <Navigate to="/" />}
            />
            <Route
              path="/privacy"
              element={user ? <PrivacyPolicy /> : <Navigate to="/" />}
            />
            <Route
              path="/feedback"
              element={user ? <Feedback user={user} /> : <Navigate to="/" />}
            />
            <Route 
              path="/chat/:username" 
              element={user ? <Chat user={user} socket={socket} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile-setup" 
              element={
                user
                  ? <ProfileSetup
                      onProfileSetupComplete={handleProfileSetupComplete}
                      onBack={() => navigate(-1)}
                      errorMessage={profileSetupError}
                    />
                  : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>

        <footer className={`${theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-soultalk-medium-gray'} py-6 border-t text-center text-sm safe-pb safe-px`}>
          <p>{t('soultalk_footer')}</p>
          <p className="text-xs mt-2">{t('made_with_love')}</p>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 safe-px safe-pb">
          <div className="bg-soultalk-white p-5 sm:p-6 rounded-lg shadow-xl max-w-sm w-full max-h-[90dvh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-soultalk-dark-gray">{t('logout_confirm_title')}</h2>
            <p className="text-soultalk-medium-gray mb-6">{t('logout_confirm_message')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-soultalk-dark-gray rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={performLogout}
                className="px-4 py-2 bg-soultalk-coral text-soultalk-white rounded-lg hover:bg-soultalk-coral/80 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfilePreview && user && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 safe-px safe-pb">
          <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-[#111827] border border-gray-800' : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-soultalk-dark-gray'}`}>
                {t('profile_photo')}
              </h3>
              <button
                type="button"
                onClick={() => setShowProfilePreview(false)}
                className="p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
                aria-label={t('close_profile_preview')}
              >
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-soultalk-medium-gray'}`} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex flex-col items-center">
                <img
                  src={currentUserAvatarUrl}
                  alt={`${user.username} profile`}
                  className="w-full max-w-[224px] aspect-square rounded-2xl object-cover shadow-lg"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
                />
                <p className={`mt-3 font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-soultalk-dark-gray'}`}>
                  {user.username}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfilePreview(false);
                    handleNavigateToProfileSetup();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-semibold py-2.5 px-4 hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  {t('change_profile_picture')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfilePreview(false)}
                  className={`w-full rounded-xl py-2.5 px-4 font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      : 'bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-200'
                  }`}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {messageToast && (
        <button
          type="button"
          onClick={() => {
            navigate(`/chat/${messageToast.from}`);
            setMessageToast(null);
          }}
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[340px] z-50 rounded-xl shadow-xl p-4 text-left safe-pb ${
            theme === 'dark' ? 'bg-gray-100 text-soultalk-dark-gray' : 'bg-soultalk-dark-gray text-soultalk-white'
          }`}
        >
          <p className="text-sm font-semibold">
            {messageToast.count > 1
              ? t('new_messages_from', { count: messageToast.count, username: messageToast.from })
              : t('new_message_from', { username: messageToast.from })}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-soultalk-white/70'}`}>{t('tap_to_open_chat')}</p>
        </button>
      )}
    </div>
  );
}

export default App;
