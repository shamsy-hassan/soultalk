import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Clock, Sparkles, Image as ImageIcon, Smile, Phone, Heart, Check, CheckCheck } from 'lucide-react'; // Added Phone icon for call, removed Mic
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

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
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);
    socket.on('message_history', handleMessageHistory); 

    setMessages([]);

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('message_delivered');
      socket.off('message_read');
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
    if (!socket || !user || !username) return;
    socket.emit('mark_messages_read', {
      reader: user.username,
      sender: username
    });
  }, [socket, user, username, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (data) => {
    const message = {
      id: data.messageId || `${Date.now()}-${data.from}-${user.username}`,
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

    if (data.from === username && socket) {
      socket.emit('mark_messages_read', {
        reader: user.username,
        sender: data.from
      });
    }
  };

  const handleMessageSent = (data) => {
    setMessages((prev) => {
      const alreadyExists = prev.some((msg) => msg.id === data.messageId);
      if (alreadyExists) {
        return prev.map((msg) =>
          msg.id === data.messageId
            ? {
                ...msg,
                translatedText: data.translatedMessage || msg.translatedText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent'
              }
            : msg
        );
      }

      const message = {
        id: data.messageId || `${Date.now()}-${user.username}-${data.to}`,
        from: user.username,
        to: data.to,
        originalText: data.message,
        translatedText: data.translatedMessage,
        fromLanguage: user.language,
        toLanguage: targetUser?.language || 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        status: 'sent'
      };
      return [...prev, message];
    });
  };

  const handleMessageDelivered = (data) => {
    if (data.to !== username) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId
          ? { ...msg, status: 'delivered' }
          : msg
      )
    );
  };

  const handleMessageRead = (data) => {
    if (data.reader !== username) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.from === user.username && msg.to === data.reader
          ? { ...msg, status: 'read' }
          : msg
      )
    );
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
        status: isSent ? 'delivered' : undefined,
      };
    });
    setMessages(history);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;
    const messageId = `${Date.now()}-${user.username}-${username}-${Math.random().toString(36).slice(2, 8)}`;

    const optimisticMessage = {
      id: messageId,
      from: user.username,
      to: username,
      originalText: newMessage,
      translatedText: newMessage,
      fromLanguage: user.language,
      toLanguage: targetUser?.language || 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sent'
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit('send_message', {
      from: user.username,
      to: username,
      message: newMessage,
      messageId
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
  const targetUserProfileImageUrl = resolveProfilePictureUrl(targetUser.profile_picture_url);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-soultalk-white to-soultalk-warm-gray/30 rounded-2xl overflow-hidden border border-gray-100">
      {/* Chat Header */}
      <div className="sticky top-0 z-20 bg-soultalk-white/95 backdrop-blur-sm p-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)} // Changed to navigate to previous page
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden" // Show back button only on mobile
          >
            <ArrowLeft className="w-5 h-5 text-soultalk-dark-gray" />
          </button>
          <div className="relative">
            <img
              src={targetUserProfileImageUrl}
              alt={targetUser.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
            />
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
      <div className="bg-soultalk-warm-gray/70 p-3 text-center border-b border-gray-100 hidden md:block"> {/* Hidden on mobile */}
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
      <div className="bg-soultalk-warm-gray/70 p-2 text-center border-b border-gray-100 md:hidden"> {/* Visible on mobile */}
        <div className="inline-flex items-center space-x-1 text-xs text-soultalk-medium-gray bg-soultalk-white rounded-full px-3 py-1 shadow-sm">
          <span>{getLanguageFlag(user.language)}</span>
          <Sparkles className="w-3 h-3 text-soultalk-lavender" />
          <span>{getLanguageFlag(targetUser.language)}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar p-4 md:p-5 bg-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative max-w-[78%] lg:max-w-[56%] p-4 shadow-sm ring-1 rounded-2xl ${
              msg.from === user.username
                ? 'bg-gradient-to-tr from-soultalk-coral to-soultalk-coral text-soultalk-white rounded-br-none ring-soultalk-coral/20' // Sent bubble
                : 'bg-gradient-to-tl from-soultalk-teal to-soultalk-teal text-soultalk-dark-gray rounded-bl-none ring-soultalk-teal/20' // Received bubble
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
                  <span className="ml-1 inline-flex items-center">
                    {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-sky-200" />}
                    {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-soultalk-white/70" />}
                    {(!msg.status || msg.status === 'sent') && <Check className="w-3.5 h-3.5 text-soultalk-white/70" />}
                  </span>
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
      <div className="sticky bottom-0 z-10 bg-soultalk-white/95 backdrop-blur-sm border-t border-gray-100 p-4"> {/* Added sticky bottom-0 */}
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
                className="input-field w-full bg-soultalk-white shadow-sm"
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
