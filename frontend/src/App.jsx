import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; // Added useNavigate
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
import { setUiLanguage, hardReload } from './i18n';
import { applyTheme, readString, PREF_THEME_KEY } from './theme'; // Import theme utilities
import { Heart, MessageSquare, X, Camera } from 'lucide-react'; // Import icons for logo and mobile menu
import ProfileSetup from './ProfileSetup'; // Import ProfileSetup component
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { uploadProfilePicture, updateUserProfile } from './profileAPI';
import { updateUserLanguage } from './api';
import { SOCKET_URL } from './config';
import LoadingSplash from './LoadingSplash';

const PREF_MESSAGE_SOUND_KEY = 'st_pref_message_sound';
const PREF_MESSAGE_VIBRATE_KEY = 'st_pref_message_vibrate';

const readBoolPref = (key, fallback = false) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch (error) {
    return fallback;
  }
};

const playNotificationTone = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;

    gain.gain.value = 0.001;
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

    oscillator.onended = () => {
      try {
        ctx.close();
      } catch (error) {
        // ignore
      }
    };
  } catch (error) {
    // ignore
  }
};

const vibrateNotification = () => {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(60);
    }
  } catch (error) {
    // ignore
  }
};

function App() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('soultalk_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [socket, setSocket] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false); // State for mobile sidebar
  const [profileSetupError, setProfileSetupError] = useState('');
  const [messageToast, setMessageToast] = useState(null);
  const [unreadByUser, setUnreadByUser] = useState({});
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Removed useEffect that set document.body.style.overflow to hidden

  useEffect(() => {
    // Apply theme on initial load
    const storedTheme = readString(PREF_THEME_KEY, 'default');
    applyTheme(storedTheme);
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (user?.language) {
      void setUiLanguage(user.language);
    }
  }, [user]);

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

      const shouldRing = readBoolPref(PREF_MESSAGE_SOUND_KEY, true);
      const shouldVibrate = readBoolPref(PREF_MESSAGE_VIBRATE_KEY, true);
      if (shouldRing) playNotificationTone();
      if (shouldVibrate) vibrateNotification();

      setUnreadByUser((prev) => ({
        ...prev,
        [sender]: (prev[sender] || 0) + 1,
      }));

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

  useEffect(() => {
    if (!user) return;

    if (location.pathname.startsWith('/chat/')) {
      const activeChatUser = decodeURIComponent(location.pathname.replace('/chat/', ''));
      setUnreadByUser((prev) => {
        if (!prev[activeChatUser]) return prev;
        const next = { ...prev };
        delete next[activeChatUser];
        return next;
      });
    }
  }, [location.pathname, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('soultalk_user', JSON.stringify(userData));
    void setUiLanguage(userData.language);
  };

  const performLogout = () => {
    if (socket) {
      socket.emit('leave', { username: user.username });
      socket.disconnect();
    }
    setUser(null);
    setUnreadByUser({});
    setMessageToast(null);
    localStorage.removeItem('soultalk_user');
    localStorage.removeItem('i18nextLng');
    void setUiLanguage('en');
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

    const { changed } = await setUiLanguage(newLang);
    setUser(prevUser => {
      const updatedUser = { ...prevUser, language: newLang };
      localStorage.setItem('soultalk_user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    try {
      await updateUserLanguage(username, newLang);
    } catch (error) {
      console.error('Failed to persist language change:', error);
    } finally {
      if (changed) {
        hardReload();
      }
    }
  };

  const handleNavigateToProfileSetup = () => {
    setProfileSetupError('');
    navigate('/profile-setup');
    setShowSidebarMobile(false); // Close sidebar on mobile when navigating
  };

  const handleProfileSetupComplete = async (croppedImageUrl) => {
    setProfileSetupError('');

    if (!user) {
      navigate('/users');
      return;
    }

    const normalizedPayload = (() => {
      if (!croppedImageUrl) return null;
      if (typeof croppedImageUrl === 'string') return { croppedImageUrl };
      if (typeof croppedImageUrl === 'object') return croppedImageUrl;
      return null;
    })();

    if (!normalizedPayload) {
      navigate('/users');
      return;
    }

    const updates = {};
    const nextBioRaw = Object.prototype.hasOwnProperty.call(normalizedPayload, 'bio')
      ? normalizedPayload.bio
      : undefined;
    if (nextBioRaw !== undefined) {
      updates.bio = typeof nextBioRaw === 'string' ? nextBioRaw.trim() : nextBioRaw;
    }

    try {
      if (normalizedPayload.croppedImageUrl) {
        const blobResponse = await fetch(normalizedPayload.croppedImageUrl);
        const imageBlob = await blobResponse.blob();
        const formData = new FormData();
        formData.append('profile_picture', imageBlob, 'profile.jpeg');

        const { res: uploadRes, data: uploadData } = await uploadProfilePicture(formData);
        if (!uploadRes.ok) {
          setProfileSetupError(uploadData.error || 'Failed to upload profile picture.');
          return;
        }
        updates.profilePictureUrl = uploadData.profile_picture_url;
      }

      if (!updates.profilePictureUrl && !Object.prototype.hasOwnProperty.call(updates, 'bio')) {
        navigate('/users');
        return;
      }

      const { res: updateRes, data: updateData } = await updateUserProfile(
        { phone: user.phone, username: user.username },
        updates
      );

      if (!updateRes.ok) {
        setProfileSetupError(updateData.error || 'Failed to update profile.');
        return;
      }

      const updatedUser = { ...user, ...updateData.user };
      setUser(updatedUser);
      localStorage.setItem('soultalk_user', JSON.stringify(updatedUser));
      navigate('/users');
    } catch (error) {
      setProfileSetupError('Error while saving profile changes.');
      console.error('Error while saving profile changes:', error);
    }
  };

  const currentUserAvatarUrl = resolveProfilePictureUrl(user?.profile_picture_url);
  const unreadCount = Object.values(unreadByUser).reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex min-h-screen bg-soultalk-white text-soultalk-dark-gray">
      {showSplash && <LoadingSplash onDone={() => setShowSplash(false)} />}

      {/* Sidebar - Desktop always visible, mobile as drawer */}
      {user && (
        <div
          className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-[300px] shadow-lg transform ${
            showSidebarMobile ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:shadow-none transition-transform duration-300 ease-in-out bg-soultalk-white overflow-hidden`}
        >
          <Sidebar 
            user={user} 
            socket={socket} 
            onLogout={handleLogoutClick} 
            onChangeLanguage={handleChangeLanguage}
            onNavigateToProfileSetup={handleNavigateToProfileSetup}
            unreadCount={unreadCount}
          />
        </div>
      )}
      {/* Mobile sidebar overlay */}
      {showSidebarMobile && user && (
        <div 
          className="fixed inset-0 z-30 md:hidden bg-gradient-to-br from-emerald-500/10 via-green-600/10 to-lime-500/10 backdrop-blur-[1px]"
          onClick={() => setShowSidebarMobile(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${user ? 'md:ml-[300px]' : ''}`}> {/* Adjust margin for desktop sidebar when user is logged in */}
        {user && (
	          <nav className="backdrop-blur-sm px-3 py-3 sm:px-4 md:px-6 shadow-sm flex items-center justify-between z-20 sticky top-0 border-b safe-pt safe-px bg-soultalk-white/90 border-emerald-400/15">
	            {/* Left side: App Logo/Name and Mobile Sidebar Toggle */}
	            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
	              {/* Mobile Sidebar Toggle - only on small screens */}
	              <button
	                className="md:hidden p-2 rounded-lg shadow-md bg-soultalk-warm-gray text-soultalk-dark-gray"
	                onClick={() => setShowSidebarMobile(!showSidebarMobile)}
	                aria-label="Toggle sidebar"
	              >
	                <MessageSquare className="w-6 h-6" />
	              </button>
	              <div className="flex items-center space-x-2 min-w-0">
	                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-soultalk-coral to-soultalk-teal flex items-center justify-center shadow-sm">
	                  <Heart className="w-5 h-5 text-emerald-50" />
	                </div>
	                <div className="min-w-0">
	                  <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate text-soultalk-dark-gray">
	                    SoulTalk
	                  </h1>
	                  <p className="text-xs hidden md:block text-soultalk-medium-gray">
	                    {t('spread_joy', { defaultValue: 'SPREAD JOY' })}
	                  </p>
	                </div>
	              </div>
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
              element={user ? <Chats user={user} unreadByUser={unreadByUser} /> : <Navigate to="/" />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage user={user} onChangeLanguage={handleChangeLanguage} /> : <Navigate to="/" />}
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
                      user={user}
                      onProfileSetupComplete={handleProfileSetupComplete}
                      onBack={() => navigate(-1)}
                      errorMessage={profileSetupError}
                    />
                  : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>

        <footer className="py-6 border-t text-center text-sm safe-pb safe-px border-emerald-400/15 text-soultalk-medium-gray">
          <p>{t('soultalk_footer')}</p>
          <p className="text-xs mt-2">{t('made_with_love')}</p>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 safe-px safe-pb">
          <div className="bg-soultalk-warm-gray p-5 sm:p-6 rounded-lg shadow-xl max-w-sm w-full max-h-[90dvh] overflow-y-auto border border-emerald-400/15">
            <h2 className="text-xl font-semibold mb-4 text-soultalk-dark-gray">{t('logout_confirm_title')}</h2>
            <p className="text-soultalk-medium-gray mb-6">{t('logout_confirm_message')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-emerald-500/10 text-soultalk-dark-gray rounded-lg hover:bg-emerald-500/15 transition-colors border border-emerald-400/15"
              >
                {t('cancel')}
              </button>
              <button
                onClick={performLogout}
                className="px-4 py-2 bg-soultalk-coral text-emerald-50 rounded-lg hover:bg-soultalk-coral/90 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfilePreview && user && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 safe-px safe-pb">
          <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-soultalk-warm-gray border border-emerald-400/15`}>
            <div className="flex items-center justify-between p-4 border-b border-emerald-400/15">
              <h3 className="font-semibold text-soultalk-dark-gray">
                {t('profile_photo')}
              </h3>
              <button
                type="button"
                onClick={() => setShowProfilePreview(false)}
                className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                aria-label={t('close_profile_preview')}
              >
                <X className="w-5 h-5 text-soultalk-medium-gray" />
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
                <p className="mt-3 font-medium text-soultalk-dark-gray">
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white st-white-visible font-semibold py-2.5 px-4 hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  {t('change_profile_picture')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfilePreview(false)}
                  className="w-full rounded-xl py-2.5 px-4 font-medium transition-colors bg-emerald-500/10 text-soultalk-dark-gray hover:bg-emerald-500/15 border border-emerald-400/15"
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
          className="fixed top-20 left-4 right-4 md:top-4 md:left-auto md:right-4 md:w-[340px] z-50 rounded-xl shadow-xl p-4 text-left safe-pt safe-px bg-soultalk-warm-gray/92 text-soultalk-dark-gray border border-emerald-400/15 backdrop-blur"
        >
          <p className="text-sm font-semibold">
            {messageToast.count > 1
              ? t('new_messages_from', { count: messageToast.count, username: messageToast.from })
              : t('new_message_from', { count: messageToast.count, username: messageToast.from })}
          </p>
          <p className="text-xs mt-1 text-soultalk-medium-gray">{t('tap_to_open_chat')}</p>
        </button>
      )}
    </div>
  );
}

export default App;
