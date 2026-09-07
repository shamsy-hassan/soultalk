import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Clock, Sparkles, Image as ImageIcon, Check, CheckCheck, MessageSquareText, Pencil, Trash2, X, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLanguageName, getLanguageFlag } from './i18n';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';
import { BACKEND_BASE_URL } from './config';

const Chat = ({ user, socket }) => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [openMenuForMessageId, setOpenMenuForMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const editingMessageIdRef = useRef(null);
  const openMenuForMessageIdRef = useRef(null);
  const openMenuContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const quickPrompts = [
    t('chat_prompt_1'),
    t('chat_prompt_2'),
    t('chat_prompt_3'),
    t('chat_prompt_4'),
  ];

  useEffect(() => {
    if (!socket || !user || !username) return;

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_read', handleMessageRead);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);
    socket.on('message_history', handleMessageHistory); 

    setMessages([]);

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('message_delivered');
      socket.off('message_read');
      socket.off('message_deleted');
      socket.off('message_edited');
      socket.off('user_typing');
      socket.off('error');
      socket.off('message_history'); 
    };
  }, [socket, username, user, navigate]);

  useEffect(() => {
    if (!username || !user || !socket) return;

    const fetchTargetUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/api/user/${username}`);
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

  useEffect(() => {
    editingMessageIdRef.current = editingMessageId;
  }, [editingMessageId]);

  useEffect(() => {
    openMenuForMessageIdRef.current = openMenuForMessageId;
  }, [openMenuForMessageId]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const openId = openMenuForMessageIdRef.current;
      if (!openId) return;
      const container = openMenuContainerRef.current;
      if (!container) {
        setOpenMenuForMessageId(null);
        return;
      }
      if (!container.contains(event.target)) {
        setOpenMenuForMessageId(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuForMessageId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (data) => {
    const createdAtMs = parseTimestampToMs(data.timestamp) ?? Date.now();
    const message = {
      id: data.id || data.messageId || `${Date.now()}-${data.from}-${user.username}`,
      clientId: data.messageId,
      serverId: data.id,
      from: data.from,
      to: user.username,
      messageType: data.messageType || 'text',
      mediaUrl: data.mediaUrl,
      originalText: data.originalMessage || data.message || '',
      translatedText: data.message || '',
      fromLanguage: targetUser?.language || 'en',
      toLanguage: user.language,
      timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs,
      editedAt: data.editedAt,
      deleted: Boolean(data.deleted),
      isReceived: true,
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
      const alreadyExists = prev.some((msg) => msg.clientId && msg.clientId === data.messageId);
      if (alreadyExists) {
        return prev.map((msg) =>
          msg.clientId === data.messageId
            ? {
                ...msg,
                id: data.id ?? msg.id,
                serverId: data.id ?? msg.serverId,
                messageType: data.messageType || msg.messageType || 'text',
                mediaUrl: data.mediaUrl ?? msg.mediaUrl,
                translatedText: data.translatedMessage || msg.translatedText,
                editedAt: data.editedAt ?? msg.editedAt,
                deleted: Boolean(data.deleted ?? msg.deleted),
                createdAtMs: parseTimestampToMs(data.timestamp) ?? msg.createdAtMs ?? Date.now(),
                timestamp: new Date(parseTimestampToMs(data.timestamp) ?? msg.createdAtMs ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent',
              }
            : msg
        );
      }

      const createdAtMs = parseTimestampToMs(data.timestamp) ?? Date.now();
      const message = {
        id: data.id || data.messageId || `${Date.now()}-${user.username}-${data.to}`,
        clientId: data.messageId,
        serverId: data.id,
        from: user.username,
        to: data.to,
        messageType: data.messageType || 'text',
        mediaUrl: data.mediaUrl,
        originalText: data.message || '',
        translatedText: data.translatedMessage || '',
        fromLanguage: user.language,
        toLanguage: targetUser?.language || 'en',
        timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtMs,
        editedAt: data.editedAt,
        deleted: Boolean(data.deleted),
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
        (msg.clientId && msg.clientId === data.messageId)
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

  const handleMessageDeleted = (data) => {
    const deletedId = data?.id;
    if (!deletedId) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === deletedId || msg.serverId === deletedId
          ? { ...msg, deleted: true, originalText: '', translatedText: '', mediaUrl: null }
          : msg
      )
    );
    if (editingMessageIdRef.current === deletedId) {
      setEditingMessageId(null);
      setNewMessage('');
    }
  };

  const handleMessageEdited = (data) => {
    const editedId = data?.id;
    if (!editedId) return;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== editedId && msg.serverId !== editedId) return msg;
        const isMine = msg.from === user.username;
        return {
          ...msg,
          originalText: data.message ?? msg.originalText,
          translatedText: isMine ? (msg.translatedText ?? '') : (data.translatedMessage ?? msg.translatedText),
          editedAt: data.editedAt ?? msg.editedAt ?? true,
        };
      })
    );
  };

  const handleMessageHistory = (data) => {
    const history = data.messages.map(msg => {
      const isSent = msg.from_user === user.username;
      const isReceived = msg.to_user === user.username;
      const createdAtMs = parseTimestampToMs(msg.timestamp) ?? Date.now();
      return {
        id: msg.id,
        serverId: msg.id,
        from: msg.from_user,
        to: msg.to_user,
        messageType: msg.message_type || 'text',
        mediaUrl: msg.media_url,
        originalText: msg.message || '',
        translatedText: msg.translated_message || '',
        fromLanguage: isSent ? user.language : targetUser?.language || 'en',
        toLanguage: isReceived ? user.language : targetUser?.language || 'en',
        timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtMs,
        editedAt: msg.edited_at,
        deleted: Boolean(msg.deleted),
        isSent: isSent,
        isReceived: isReceived,
        status: isSent ? 'delivered' : undefined,
      };
    });
    setMessages(history);
  };

  const parseTimestampToMs = (value) => {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    const raw = String(value);
    const direct = Date.parse(raw);
    if (!Number.isNaN(direct)) return direct;
    // SQLite timestamp: "YYYY-MM-DD HH:MM:SS"
    const sqlite = Date.parse(raw.replace(' ', 'T') + 'Z');
    if (!Number.isNaN(sqlite)) return sqlite;
    return null;
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;
    if (editingMessageId) {
      socket.emit('edit_message', {
        from: user.username,
        to: username,
        messageId: editingMessageId,
        message: newMessage,
      });
      setEditingMessageId(null);
      setNewMessage('');
      setOpenMenuForMessageId(null);
      return;
    }
    const messageId = `${Date.now()}-${user.username}-${username}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAtMs = Date.now();

    const optimisticMessage = {
      id: messageId,
      clientId: messageId,
      from: user.username,
      to: username,
      messageType: 'text',
      mediaUrl: null,
      originalText: newMessage,
      translatedText: newMessage,
      fromLanguage: user.language,
      toLanguage: targetUser?.language || 'en',
      timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs,
      isSent: true,
      status: 'sent'
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit('send_message', {
      from: user.username,
      to: username,
      message: newMessage,
      messageId,
      messageType: 'text',
    });

    setTyping(false);
    socket.emit('typing', { from: user.username, to: username, is_typing: false });
    setNewMessage('');
  };

  const handleSendImage = async (file) => {
    if (!file || !socket) return;
    const messageId = `${Date.now()}-${user.username}-${username}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAtMs = Date.now();

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return;
    }

    const optimisticMessage = {
      id: messageId,
      clientId: messageId,
      from: user.username,
      to: username,
      messageType: 'image',
      mediaUrl: dataUrl,
      originalText: '',
      translatedText: '',
      fromLanguage: user.language,
      toLanguage: targetUser?.language || 'en',
      timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs,
      isSent: true,
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit('send_message', {
      from: user.username,
      to: username,
      message: '',
      messageId,
      messageType: 'image',
      mediaUrl: dataUrl,
    });
  };

  const startEditMessage = (msg) => {
    const id = msg.serverId || msg.id;
    if (!id || typeof id !== 'number' || msg.deleted) return;
    if ((msg.messageType || 'text') !== 'text') return;
    setOpenMenuForMessageId(null);
    setEditingMessageId(id);
    setNewMessage(msg.originalText || '');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage('');
    setOpenMenuForMessageId(null);
  };

  const deleteMessage = (msg) => {
    const id = msg.serverId || msg.id;
    if (!id || typeof id !== 'number' || msg.deleted || !socket) return;
    const ok = window.confirm(t('delete_message_confirm', { defaultValue: 'Delete this message?' }));
    if (!ok) return;
    socket.emit('delete_message', { from: user.username, messageId: id });
  };

  const canEditMessage = (msg) => {
    if (!msg || msg.deleted) return false;
    if (msg.from !== user.username) return false;
    if (typeof (msg.serverId || msg.id) !== 'number') return false;
    if ((msg.messageType || 'text') !== 'text') return false;
    const createdAtMs = msg.createdAtMs;
    if (!createdAtMs) return false;
    return Date.now() - createdAtMs <= 60_000;
  };

  const applyPrompt = (text) => {
    setNewMessage((prev) => (prev?.trim() ? `${prev}\n${text}` : text));
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    handleTyping();
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
    <div className="flex min-h-[calc(100dvh-7rem)] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Chat Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white p-3 safe-pt safe-px sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={() => navigate(-1)} // Changed to navigate to previous page
            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors md:hidden" // Show back button only on mobile
          >
            <ArrowLeft className="w-5 h-5 text-heybuddy-dark-gray" />
          </button>
          <div className="relative">
            <img
              src={targetUserProfileImageUrl}
              alt={targetUser.username}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-400/15"
              onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-heybuddy-dark-gray truncate">{username}</h2>
            <div className="flex items-center space-x-1 text-xs text-heybuddy-medium-gray truncate">
              {t('speaking')}: {getLanguageName(targetUser.language)} {getLanguageFlag(targetUser.language)}
            </div>
          </div>
        </div>
      </div>

      {/* Language Bridge Indicator (Full for desktop, compact for mobile) */}
      <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-center hidden sm:block">
        <div className="inline-flex items-center space-x-2 text-xs text-heybuddy-medium-gray">
          <span>{getLanguageFlag(user.language)} {t('language_you_speak', { language: getLanguageName(user.language) })}</span>
          <span className="text-heybuddy-medium-gray">—</span>
          <Sparkles className="w-4 h-4 text-heybuddy-lavender" /> {/* Small bridge icon */}
          <span className="text-heybuddy-medium-gray">—</span>
          <span>{getLanguageFlag(targetUser.language)} {t('language_they_speak', { language: getLanguageName(targetUser.language) })}</span>
        </div>
        <p className="text-xs text-heybuddy-medium-gray mt-1">{t('messages_translate_automatically_explanation')}</p>
      </div>

      {/* Compact Language Bridge Indicator for Mobile */}
      <div className="border-b border-slate-100 bg-slate-50 p-2 text-center sm:hidden">
        <div className="inline-flex items-center space-x-1 text-xs text-heybuddy-medium-gray">
          <span>{getLanguageFlag(user.language)}</span>
          <Sparkles className="w-3 h-3 text-heybuddy-lavender" />
          <span>{getLanguageFlag(targetUser.language)}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar p-3 sm:p-4 md:p-5 bg-transparent">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 md:p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                      <p className="text-sm font-semibold text-heybuddy-dark-gray inline-flex items-center gap-2">
                        <MessageSquareText className="w-4 h-4 text-heybuddy-lavender" />
                      {t('chat_starter_title')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => applyPrompt(prompt)}
                      className="px-3 py-2 rounded-full bg-heybuddy-warm-gray text-heybuddy-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.clientId || msg.id}
            className={`mb-4 flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`group relative max-w-[86%] sm:max-w-[78%] lg:max-w-[56%] p-3.5 sm:p-4 shadow-sm ring-1 rounded-2xl ${
              msg.from === user.username
                ? 'bg-heybuddy-coral text-white rounded-br-none'
                : 'bg-slate-100 text-heybuddy-dark-gray rounded-bl-none'
            }`}>
              {msg.from === user.username && !msg.deleted && typeof (msg.serverId || msg.id) === 'number' && (
                <div
                  ref={openMenuForMessageId === (msg.serverId || msg.id) ? openMenuContainerRef : null}
                  className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const id = msg.serverId || msg.id;
                      setOpenMenuForMessageId((prev) => (prev === id ? null : id));
                    }}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-heybuddy-white/90 text-heybuddy-dark-gray ring-1 ring-emerald-400/15 shadow-sm hover:bg-heybuddy-white"
                    aria-haspopup="menu"
                    aria-expanded={openMenuForMessageId === (msg.serverId || msg.id)}
                    aria-label={t('message_actions', { defaultValue: 'Message actions' })}
                    title={t('message_actions', { defaultValue: 'Message actions' })}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuForMessageId === (msg.serverId || msg.id) && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-44 rounded-xl bg-heybuddy-warm-gray/95 text-heybuddy-dark-gray shadow-xl ring-1 ring-emerald-400/15 backdrop-blur p-1 z-30"
                    >
                      {canEditMessage(msg) && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            startEditMessage(msg);
                            setOpenMenuForMessageId(null);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-emerald-500/10 transition-colors inline-flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          {t('edit_message', { defaultValue: 'Edit message' })}
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          deleteMessage(msg);
                          setOpenMenuForMessageId(null);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-emerald-500/10 transition-colors inline-flex items-center gap-2 text-heybuddy-coral"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('delete_message', { defaultValue: 'Delete message' })}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {msg.deleted ? (
                <p className="text-sm italic opacity-75">
                  {t('message_deleted', { defaultValue: 'Message deleted' })}
                </p>
              ) : (msg.messageType === 'image' && msg.mediaUrl) ? (
                <img
                  src={msg.mediaUrl}
                  alt={t('image_message_alt', { defaultValue: 'Sent image' })}
                  className="max-h-[320px] w-auto rounded-xl object-contain ring-1 ring-black/5 bg-heybuddy-white/40"
                  loading="lazy"
                />
              ) : (
                <>
                  {/* Original message (faint) for received messages if translated */}
                  {(msg.from !== user.username && msg.originalText && msg.originalText !== msg.translatedText) && (
                    <p className="text-xs text-heybuddy-medium-gray mb-1">{msg.originalText}</p>
                  )}
                  <p className="text-sm">{msg.from === user.username ? msg.originalText : msg.translatedText}</p>
                </>
              )}
              
              {/* Soul Translate Badge on hover (using group-hover for parent message div) */}
              {!msg.deleted && msg.messageType === 'text' && (
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-heybuddy-white/70 px-2 py-1 rounded-full flex items-center space-x-1 ring-1 ring-emerald-400/15 backdrop-blur">
                  <Sparkles className="w-3 h-3 text-heybuddy-lavender" />
                    <span className="text-heybuddy-medium-gray">{t('HeyBuddy_title')}</span>
                </div>
              )}

              {/* Timestamp and Read Receipt */}
              <div className={`text-xs mt-2 flex items-center ${msg.from === user.username ? 'text-emerald-50/75 justify-end' : 'text-heybuddy-medium-gray justify-start'}`}>
                <Clock className="w-3 h-3 mr-1" />
                <span>{msg.timestamp}</span>
                {msg.editedAt && !msg.deleted && msg.messageType === 'text' && (
                  <span className="ml-2 opacity-80">
                    • {t('edited_label', { defaultValue: 'edited' })}
                  </span>
                )}
                {msg.from === user.username && (
                  <span className="ml-1 inline-flex items-center">
                    {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-emerald-100" />}
                    {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-emerald-50/70" />}
                    {(!msg.status || msg.status === 'sent') && <Check className="w-3.5 h-3.5 text-emerald-50/70" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="inline-block bg-heybuddy-warm-gray text-heybuddy-dark-gray rounded-2xl rounded-bl-none p-3 ring-1 ring-emerald-400/15">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-heybuddy-medium-gray ml-2">{username} {t('is_typing')}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white p-3 safe-pb safe-px sm:p-4">

        {editingMessageId && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 border border-emerald-400/15 px-3 py-2 text-xs text-heybuddy-dark-gray">
            <span className="font-medium">{t('editing_message', { defaultValue: 'Editing message' })}</span>
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-emerald-500/10 transition-colors"
            >
              <X className="w-4 h-4" />
              {t('cancel')}
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  try {
                    await handleSendImage(file);
                  } catch (error) {
                    console.error('Failed to send image:', error);
                  }
                }}
              />
              <button
                type="button"
                className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('send_image', { defaultValue: 'Send image' })}
                title={t('send_image', { defaultValue: 'Send image' })}
              >
                <ImageIcon className="w-5 h-5 text-heybuddy-medium-gray" />
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
                className="input-field w-full resize-none"
                rows="1"
                maxLength={2000}
              />
            </div>
	            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-heybuddy-medium-gray">
	              <span>{t('press_enter_to_send')} • {t('shift_enter_for_new_line')}</span>
	              <span>
	                {t('feedback_char_count')}:{' '}
	                {t('character_count', {
	                  count: newMessage.length,
	                  max: 2000,
	                  defaultValue: '{{count}}/{{max}}',
	                })}
	              </span>
	            </div>
	          </div>
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            aria-label={t('send_message')}
            className={`p-3 sm:p-4 rounded-xl flex items-center justify-center shrink-0 ${
              newMessage.trim()
                ? 'bg-heybuddy-coral text-white hover:bg-heybuddy-gradient-end'
                : 'bg-slate-100 text-heybuddy-medium-gray'
            } transition-colors disabled:opacity-60`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
