import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Globe, Clock, User, Sparkles, Image as ImageIcon, Smile, Phone, Heart } from 'lucide-react'; // Added Phone icon for call, removed Mic
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
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !user || !username) return;

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);
    socket.on('message_history', handleMessageHistory); 

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

    const fetchTargetUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${username}`);
        setTargetUser(response.data);
      } catch (error) {
        console.error('Chat.jsx: Error fetching target user:', error);
        navigate('/users');
      }
    };

    fetchTargetUser();
  }, [username, user, navigate, socket]);

  useEffect(() => {
    if (targetUser && user && socket) {
      socket.emit('request_message_history', { user1: user.username, user2: username });
    }
  }, [targetUser, user, socket, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (data) => {
    const message = {
      id: `${Date.now()}-${data.from}-${user.username}`,
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
      id: `${Date.now()}-${user.username}-${data.to}`,
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
    console.error('Chat.jsx: Socket error:', data.message);
  };

  const handleMessageHistory = (data) => {
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
    setMessages(history);
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

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { from: user.username, to: username, is_typing: false });
    }, 2000);
  };

  if (!targetUser) return null;

  return (
    <div className="flex-1 flex flex-col bg-soultalk-white">
      {/* Chat Header */}
      <div className="sticky top-0 z-20 bg-soultalk-warm-gray p-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)} // Changed to navigate to previous page
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden" // Show back button only on mobile
          >
            <ArrowLeft className="w-5 h-5 text-soultalk-dark-gray" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-soultalk-coral to-soultalk-teal rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-soultalk-white">
                {targetUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Soul Status Indicator for target user */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 text-soultalk-coral animate-pulse" title="Connected soul">
                <Heart className="w-full h-full fill-current" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-soultalk-dark-gray">{username}</h2>
            <div className="flex items-center space-x-1 text-xs text-soultalk-medium-gray">
              {t('speaking')}: {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-soultalk-warm-gray rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-soultalk-dark-gray" /> {/* Call Button */}
          </button>
          {/* <button className="p-2 hover:bg-soultalk-warm-gray rounded-lg transition-colors">
            <Video className="w-5 h-5 text-soultalk-dark-gray" />
          </button> */}
        </div>
      </div>

      {/* Language Bridge Indicator (Full for desktop, compact for mobile) */}
      <div className="bg-soultalk-warm-gray p-3 text-center border-b border-gray-100 hidden md:block"> {/* Hidden on mobile */}
        <div className="inline-flex items-center space-x-2 text-sm text-soultalk-medium-gray bg-soultalk-white rounded-full px-4 py-2 shadow-sm">
          <span>{getLanguageFlag(user.language)} {t('language_you_speak', { language: getLanguageName(user.language) })}</span>
          <span className="text-soultalk-medium-gray">—</span>
          <Sparkles className="w-4 h-4 text-soultalk-lavender" /> {/* Small bridge icon */}
          <span className="text-soultalk-medium-gray">—</span>
          <span>{getLanguageFlag(targetUser.language)} {t('language_they_speak', { language: getLanguageName(targetUser.language) })}</span>
        </div>
        <p className="text-xs text-soultalk-medium-gray mt-1">{t('messages_translate_automatically_explanation')}</p>
      </div>

      {/* Compact Language Bridge Indicator for Mobile */}
      <div className="bg-soultalk-warm-gray p-2 text-center border-b border-gray-100 md:hidden"> {/* Visible on mobile */}
        <div className="inline-flex items-center space-x-1 text-xs text-soultalk-medium-gray bg-soultalk-white rounded-full px-3 py-1 shadow-sm">
          <span>{getLanguageFlag(user.language)}</span>
          <Sparkles className="w-3 h-3 text-soultalk-lavender" />
          <span>{getLanguageFlag(targetUser.language)}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-soultalk-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative max-w-[70%] lg:max-w-[50%] p-4 shadow-md rounded-2xl ${
              msg.from === user.username
                ? 'bg-gradient-to-tr from-soultalk-coral to-soultalk-coral text-soultalk-white rounded-br-none' // Sent bubble
                : 'bg-gradient-to-tl from-soultalk-teal to-soultalk-teal text-soultalk-dark-gray rounded-bl-none' // Received bubble
            }`}>
              {/* Original message (faint) for received messages if translated */}
              {(msg.from !== user.username && msg.originalText !== msg.translatedText) && (
                <p className="text-xs text-soultalk-dark-gray/60 mb-1">{msg.originalText}</p>
              )}
              {/* Main translated message */}
              <p className="text-sm">{msg.from === user.username ? msg.originalText : msg.translatedText}</p>
              
              {/* Soul Translate Badge on hover (using group-hover for parent message div) */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-soultalk-warm-gray px-2 py-1 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-soultalk-lavender" />
                <span className="text-soultalk-medium-gray">SoulTalk</span>
              </div>

              {/* Timestamp and Read Receipt */}
              <div className={`text-xs mt-2 flex items-center ${msg.from === user.username ? 'text-soultalk-white/70 justify-end' : 'text-soultalk-dark-gray/70 justify-start'}`}>
                <Clock className="w-3 h-3 mr-1" />
                <span>{msg.timestamp}</span>
                {msg.from === user.username && (
                  <span className="ml-1">❤️❤️</span> // Double heart read receipt
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="inline-block bg-soultalk-warm-gray text-soultalk-dark-gray rounded-2xl rounded-bl-none p-3">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-soultalk-medium-gray ml-2">{username} {t('is_typing')}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 bg-soultalk-white border-t border-gray-100 p-4"> {/* Added sticky bottom-0 */}
        {/* Soul Translator Bar above input */}
        <div className="mb-3 p-2 bg-soultalk-warm-gray rounded-lg flex items-center justify-center space-x-2 text-sm text-soultalk-medium-gray hidden md:flex"> {/* Hidden on mobile */}
          <span>{t('you')}: {getLanguageFlag(user.language)} {getLanguageName(user.language)}</span>
          <Sparkles className="w-4 h-4 text-soultalk-lavender" />
          <span>{t('them')}: {getLanguageFlag(targetUser.language)} {getLanguageName(targetUser.language)}</span>
        </div>

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="flex space-x-2 mb-2">
              <button className="p-2 hover:bg-soultalk-warm-gray rounded-lg transition-colors">
                <ImageIcon className="w-5 h-5 text-soultalk-medium-gray" />
              </button>
              <button className="p-2 hover:bg-soultalk-warm-gray rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-soultalk-medium-gray" />
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
                className="input-field w-full"
                rows="2"
              />
            </div>
            <div className="text-xs text-soultalk-medium-gray mt-2">
              {t('press_enter_to_send')} • {t('shift_enter_for_new_line')}
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-4 rounded-xl flex items-center justify-center ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white hover:opacity-90'
                : 'bg-soultalk-warm-gray text-soultalk-medium-gray'
            } transition-all duration-300 transform hover:scale-105`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;