import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import Login from './Login';
import Users from './Users';
import Chat from './Chat';
import Sidebar from './Sidebar'; // Import the new Sidebar component
import { io } from 'socket.io-client';
import './index.css';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { Heart, MessageSquare } from 'lucide-react'; // Import icons for logo and mobile menu
import ProfileSetup from './ProfileSetup'; // Import ProfileSetup component

function App() {
  const { t } = useTranslation();
  const location = useLocation(); // To check current path for layout adjustments
  const navigate = useNavigate(); // Initialize useNavigate
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('soultalk_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [socket, setSocket] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false); // State for mobile sidebar

  useEffect(() => {
    if (user) {
      i18n.changeLanguage(user.language);
    } else {
      i18n.changeLanguage('en');
    }
  }, [user]);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join', { username: user.username });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('soultalk_user', JSON.stringify(userData));
    i18n.changeLanguage(userData.language);
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

  const handleChangeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    setUser(prevUser => {
      const updatedUser = { ...prevUser, language: newLang };
      localStorage.setItem('soultalk_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleNavigateToProfileSetup = () => {
    navigate('/profile-setup');
    setShowSidebarMobile(false); // Close sidebar on mobile when navigating
  };

  const handleProfileSetupComplete = (croppedImageUrl) => {
    // In a real app, you would upload the croppedImageUrl to the server
    // and update the user object. For now, we just navigate.
    console.log('Profile setup complete with image:', croppedImageUrl);
    navigate('/users');
  };

  // Determine if the current route is one that should show the main app layout (with sidebar)
  const showMainAppLayout = user && (location.pathname === '/users' || location.pathname.startsWith('/chat/') || location.pathname === '/profile-setup');

  return (
    <div className="flex min-h-screen bg-soultalk-white">


      {/* Sidebar - Desktop always visible, mobile as drawer */}
      {user && (
        <div className={`fixed inset-y-0 left-0 z-40 w-[300px] bg-soultalk-white shadow-lg transform ${
            showSidebarMobile ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:shadow-none transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <Sidebar 
            user={user} 
            socket={socket} 
            onLogout={handleLogoutClick} 
            onChangeLanguage={handleChangeLanguage}
            onNavigateToProfileSetup={handleNavigateToProfileSetup}
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
      <div className={`flex-1 flex flex-col ${user ? 'md:ml-[300px]' : ''}`}> {/* Adjust margin for desktop sidebar when user is logged in */}
        {user && (
          <nav className="bg-soultalk-white p-4 shadow-md flex items-center justify-between z-20 sticky top-0 border-b border-gray-100">
            {/* Left side: App Logo/Name and Mobile Sidebar Toggle */}
            <div className="flex items-center space-x-4">
              {/* Mobile Sidebar Toggle - only on small screens */}
              <button
                className="md:hidden p-2 rounded-lg bg-soultalk-warm-gray shadow-md"
                onClick={() => setShowSidebarMobile(!showSidebarMobile)}
                aria-label="Toggle sidebar"
              >
                <MessageSquare className="w-6 h-6 text-soultalk-dark-gray" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-soultalk-coral to-soultalk-teal flex items-center justify-center">
                  <Heart className="w-5 h-5 text-soultalk-white" />
                </div>
                <h1 className="text-xl font-bold text-soultalk-dark-gray">SoulTalk</h1>
              </div>
            </div>
            {/* Right side: User menu/Profile picture (Desktop only for now, later can be a UserMenu component) */}
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt="Profile" className="w-10 h-10 rounded-full object-cover hidden md:block" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-soultalk-dark-gray font-semibold hidden md:block">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </nav>
        )}

        <main className="flex-1 overflow-y-auto p-4"> {/* Adjusted padding */}
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
              path="/chat/:username" 
              element={user ? <Chat user={user} socket={socket} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile-setup" 
              element={user ? <ProfileSetup onProfileSetupComplete={handleProfileSetupComplete} onBack={() => navigate(-1)} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <footer className="py-6 border-t border-gray-200 text-center text-soultalk-medium-gray text-sm">
          <p>{t('soultalk_footer')}</p>
          <p className="text-xs mt-2">{t('made_with_love')}</p>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity50 flex items-center justify-center z-50">
          <div className="bg-soultalk-white p-6 rounded-lg shadow-xl max-w-sm w-full">
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
    </div>
  );
}

export default App;