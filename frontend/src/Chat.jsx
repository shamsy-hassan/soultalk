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
  const typingTimeoutRef = useRef(null); // Declare typingTimeout using useRef

  useEffect(() => {
    if (!socket || !user || !username) return;

    // Set up event listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);
    socket.on('message_history', handleMessageHistory); 

    // Clear messages when chat changes
    console.log('Chat.jsx: Clearing messages on chat change. Current username:', username, 'User object:', user);
    setMessages([]);

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('user_typing');
      socket.off('error');
      socket.off('message_history'); 
    };
  }, [socket, username, user, navigate]);

  useEffect(() => {
    if (!username || !user || !socket) return;

    console.log('Chat.jsx: Attempting to fetch target user:', username);
    const fetchTargetUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${username}`);
        setTargetUser(response.data);
        console.log('Chat.jsx: Successfully fetched target user:', response.data);
      } catch (error) {
        console.error('Chat.jsx: Error fetching target user:', error);
        navigate('/users');
      }
    };

    fetchTargetUser();
  }, [username, user, navigate, socket]);

  useEffect(() => {
    if (targetUser && user && socket) {
      console.log(`Chat.jsx: Target user and current user available. Emitting request_message_history for user1: ${user.username}, user2: ${username}`);
      socket.emit('request_message_history', { user1: user.username, user2: username });
    } else {
      console.log('Chat.jsx: Not emitting request_message_history. targetUser:', targetUser, 'user:', user, 'socket:', socket);
    }
  }, [targetUser, user, socket, username]);

  useEffect(() => {
    console.log('Chat.jsx: Messages state updated, scrolling to bottom. Current messages count:', messages.length);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (data) => {
    console.log('Chat.jsx: Received new message:', data);
    const message = {
      id: `${Date.now()}-${data.from}-${user.username}`, // More robust temporary ID
      from: data.from,
      to: user.username,
      originalText: data.originalMessage || data.message,
      translatedText: data.message,
      fromLanguage: targetUser?.language || 'en',
      toLanguage: user.language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReceived: true
    };
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Chat.jsx: New messages state after handleReceiveMessage:', newMessages);
      return newMessages;
    });
  };

  const handleMessageSent = (data) => {
    console.log('Chat.jsx: Message sent confirmation:', data);
    const message = {
      id: `${Date.now()}-${user.username}-${data.to}`, // More robust temporary ID
      from: user.username,
      to: data.to,
      originalText: data.message,
      translatedText: data.translatedMessage,
      fromLanguage: user.language,
      toLanguage: targetUser?.language || 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true
    };
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('Chat.jsx: New messages state after handleMessageSent:', newMessages);
      return newMessages;
    });
  };

  const handleUserTyping = (data) => {
    if (data.from === username) {
      setIsTyping(data.is_typing);
      console.log(`Chat.jsx: User ${data.from} is typing: ${data.is_typing}`);
    }
  };

  const handleError = (data) => {
    console.error('Chat.jsx: Socket error:', data.message);
  };

  const handleMessageHistory = (data) => {
    console.log('Chat.jsx: Received message history. Data:', data);
    const chatPartner = data.chatPartner;
    const history = data.messages.map(msg => {
      const isSent = msg.from_user === user.username;
      const isReceived = msg.to_user === user.username;
      return {
        id: msg.id,
        from: msg.from_user,
        to: msg.to_user,
        originalText: msg.message,
        translatedText: msg.translated_message,
        fromLanguage: isSent ? user.language : targetUser?.language || 'en',
        toLanguage: isReceived ? user.language : targetUser?.language || 'en',
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: isSent,
        isReceived: isReceived,
      };
    });
    console.log('Chat.jsx: Mapped message history:', history);
    setMessages(history);
    console.log('Chat.jsx: Messages state after handleMessageHistory. Count:', history.length, 'Messages:', history);
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
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { from: user.username, to: username, is_typing: false });
    }, 2000);
  };

  if (!targetUser) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{username}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">
                    {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600">{t('online')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Language Bridge Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-gray-900 mb-1">{t('you')}</div>
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {getLanguageName(user.language)} {getLanguageFlag(user.language)}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-gray-900 mb-1">{username}</div>
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{username}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
            </div>
          </div>
        </div>
        

      </div>

      {/* Chat Container */}
      <div className="card p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.from === user.username ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block max-w-xs md:max-w-md message-bubble ${
                msg.from === user.username
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
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
                
                <div className={`text-xs mt-2 flex items-center ${msg.from === user.username ? 'text-white/70' : 'text-gray-500'}`}>
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
              <div className="inline-block bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-4">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm text-gray-600 ml-2">{username} {t('is_typing')}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="flex space-x-2 mb-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Mic className="w-5 h-5 text-gray-500" />
                </button>
              </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  rows="2"
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getLanguageFlag(user.language)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {t('press_enter_to_send')} • {t('shift_enter_for_new_line')}
              </div>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className={`p-4 rounded-xl flex items-center justify-center ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-400'
              } transition-all duration-300 transform hover:scale-105`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>
                {t('messages_auto_translate_to_target_language', { targetLanguage: getLanguageName(targetUser.language) })}
              </span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Chat;