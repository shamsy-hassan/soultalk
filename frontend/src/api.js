// frontend/src/api.js
// Centralized API functions

import { BACKEND_BASE_URL } from './config';
import axios from 'axios'; 

export const getUsers = async (currentUsername) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/users`, {
    params: { current_user: currentUsername }
  });
  return response.data;
};

export const fetchTargetUser = async (username) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/user/${username}`);
  return response.data;
};

export const getLanguages = async ({ countryCode, uiOnly } = {}) => {
  const params = {};
  if (countryCode) {
    params.country = countryCode;
  }
  if (uiOnly) {
    params.ui_only = 'true';
  }

  const response = await axios.get(`${BACKEND_BASE_URL}/api/languages`, { params });
  return response.data;
};

export const updateUserLanguage = async (username, language) => {
  const response = await axios.post(`${BACKEND_BASE_URL}/api/update-user-language`, {
    username,
    language
  });
  return response.data;
};

export const getChatPartners = async (currentUsername) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/chats`, {
    params: { current_user: currentUsername }
  });
  return response.data;
};

export const getFavorites = async (username) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/favorites`, {
    params: { username },
  });
  return response.data;
};

export const setFavorite = async (username, favoriteUsername, isFavorite) => {
  const response = await axios.post(`${BACKEND_BASE_URL}/api/favorites`, {
    username,
    favorite_username: favoriteUsername,
    is_favorite: isFavorite,
  });
  return response.data;
};

export const submitFeedback = async ({ username, email, category, message, language }) => {
  const response = await axios.post(`${BACKEND_BASE_URL}/api/feedback`, {
    username,
    email,
    category,
    message,
    language
  });
  return response.data;
};

export const getUserImages = async (username, { limit = 200 } = {}) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/media/images`, {
    params: { username, limit },
  });
  return response.data;
};
