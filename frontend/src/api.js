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
