import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Globe, Clock, User, Sparkles, Mic, Image as ImageIcon, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';

const Chat = ({ user, socket }) => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const fetchTargetUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${username}`);
        setTargetUser(response.data);
      } catch (error) {
        console.error('Error fetching target user:', error);
        navigate('/users');
      }
    };

    fetchTargetUser();

    // Set up event listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);

    // Clear messages when chat changes
    setMessages([]);

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('user_typing');
      socket.off('error');
    };
  }, [socket, username, user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (data) => {
    const message = {
      id: messages.length + 1,
      from: data.from,
      to: user.username,
      originalText: data.originalMessage || data.message,
      translatedText: data.message,
      fromLanguage: targetUser?.language || 'en',
      toLanguage: user.language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReceived: true
    };
    setMessages(prev => [...prev, message]);
  };

  const handleMessageSent = (data) => {
    const message = {
      id: messages.length + 1,
      from: user.username,
      to: data.to,
      originalText: data.message,
      translatedText: data.translatedMessage,
      fromLanguage: user.language,
      toLanguage: targetUser?.language || 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true
    };
    setMessages(prev => [...prev, message]);
  };

  const handleUserTyping = (data) => {
    if (data.from === username) {
      setIsTyping(data.is_typing);
    }
  };

  const handleError = (data) => {
    console.error('Socket error:', data.message);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      from: user.username,
      to: username,
      message: newMessage
    });

    setTyping(false);
    socket.emit('typing', { from: user.username, to: username, is_typing: false });
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { from: user.username, to: username, is_typing: true });
    }

    // Reset typing indicator after 2 seconds
    clearTimeout(typingTimeout);
    const typingTimeout = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { from: user.username, to: username, is_typing: false });
    }, 2000);
  };

  if (!targetUser) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => navigate('/users')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-lg md:text-xl font-bold text-purple-600">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-900">{username}</h2>
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
                    </span>
                  </div>
                  <span className="text-gray-400\">•</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">{t('online')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Bridge Info - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-3 gap-4 items-center">
            <div className="text-center p-2">
              <div className="text-base font-semibold text-gray-900 mb-1">{t('you')}</div>
              <div className="text-sm text-gray-600">
                {getLanguageName(user.language)} {getLanguageFlag(user.language)}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            
            <div className="text-center p-2">
              <div className="text-base font-semibold text-gray-900 mb-1">{username}</div>
              <div className="text-sm text-gray-600">
                {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`inline-block max-w-xs md:max-w-md p-3 rounded-2xl message-bubble ${
                  msg.from === user.username
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  <div className="text-sm">{msg.from === user.username ? msg.originalText : msg.translatedText}</div>
                  
                  {/* Translation indicator */}
                  {(msg.from === user.username && msg.originalText !== msg.translatedText) && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex items-center space-x-1 text-xs opacity-80">
                        <Sparkles className="w-3 h-3" />
                        <span>{t('translated_to_target_language', { targetLanguage: getLanguageName(targetUser.language) })}</span>
                      </div>
                    </div>
                  )}
                  
                  {(msg.from !== user.username && msg.originalText !== msg.translatedText) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {t('original')}: {msg.originalText}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{t('translated_from_source_language', { sourceLanguage: getLanguageName(msg.fromLanguage) })}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 flex items-center justify-end ${msg.from === user.username ? 'text-white/70' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {msg.timestamp}
                    {msg.from === user.username && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="mb-4 text-left">
                <div className="inline-block bg-white text-gray-800 rounded-2xl rounded-bl-none p-3 border border-gray-200">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-2 sm:p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t('type_your_message_in', { language: getLanguageName(user.language) })}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none bg-gray-100"
                    rows="1"
                  />
                  <div className="absolute right-3 bottom-2 flex items-center space-x-2">
                     <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl flex items-center justify-center ${
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-400'
                } transition-all duration-200`}
              >
                <Send className="w-5 h-5" />
              </button>
               <button className="p-3 hover:bg-gray-200 rounded-xl transition-colors md:hidden">
                  <Mic className="w-5 h-5 text-gray-500" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;