import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Users from './Users';
import Chat from './Chat';
import { io } from 'socket.io-client';
import './index.css';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('soultalk_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [socket, setSocket] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for logout confirmation

  useEffect(() => {
    if (user) {
      i18n.changeLanguage(user.language);
    } else {
      // If no user is logged in, default to English
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

  // Renamed the original handleLogout to perform actual logout
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
    setShowLogoutConfirm(false); // Close modal after logout
    // No need to navigate here, the user state change will trigger it
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true); // Show confirmation modal
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false); // Hide confirmation modal
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-800">{t('soultalk_title')}</h1>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {t('real_time_language_bridge')}
              </span>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-purple-600">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">
                      {t('language')}: {user.language === 'en' ? 'English' : 
                               user.language === 'sw' ? 'Swahili' : 
                               user.language === 'am' ? 'Amharic' : user.language}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick} // Use new click handler
                  className="text-sm text-gray-600 hover:text-purple-600 px-3 py-1 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
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
          </Routes>
        </main>

        <footer className="mt-12 py-6 border-t border-gray-200 text-center text-gray-600">
          <p className="text-sm">{t('soultalk_footer')}</p>
          <p className="text-xs mt-2">{t('made_with_love')}</p>
        </footer>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">{t('logout_confirm_title')}</h2>
              <p className="text-gray-700 mb-6">{t('logout_confirm_message')}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={performLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;