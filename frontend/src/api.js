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