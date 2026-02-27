// frontend/src/profileAPI.js
// Centralized API functions for user profiles

import { BACKEND_BASE_URL } from './config';
import axios from 'axios';

export const verifyOtp = async (phone, otp, username, language, email, profile_picture_url) => {
  const res = await fetch(`${BACKEND_BASE_URL}/api/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp, username, language, email, profile_picture_url }),
  });
  const data = await res.json();
  return { res, data };
};

export const requestOtp = async (phone, email) => {
  const res = await fetch(`${BACKEND_BASE_URL}/api/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, email }),
  });
  const data = await res.json();
  return { res, data };
};

export const checkPhone = async (phone) => {
  const res = await fetch(`${BACKEND_BASE_URL}/api/check-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  return { res, data };
};

export const uploadProfilePicture = async (formData) => {
  const res = await fetch(`${BACKEND_BASE_URL}/api/upload-profile-picture`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { res, data };
};

export const updateUserProfile = async (identifier, profilePictureUrl) => {
  if (!profilePictureUrl) {
    throw new Error('Profile picture URL is required for updating user profile');
  }

  const payload = { profile_picture_url: profilePictureUrl };

  if (typeof identifier === 'string') {
    payload.phone = identifier;
  } else if (identifier && typeof identifier === 'object') {
    if (identifier.phone) payload.phone = identifier.phone;
    if (identifier.username) payload.username = identifier.username;
  }

  if (!payload.phone && !payload.username) {
    throw new Error('Phone number or username is required for updating user profile');
  }

  const res = await fetch(`${BACKEND_BASE_URL}/api/update-user-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { res, data };
};

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
