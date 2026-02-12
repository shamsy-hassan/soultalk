// frontend/src/api.js

const API_BASE_URL = 'http://localhost:5000/api';

async function callApi(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
    }
    return response.json();
}

// User Endpoints
export const registerUser = (username, language) => 
    callApi('/register', 'POST', { username, language });

export const getUsers = (current_user, token) =>
    callApi(`/users?current_user=${current_user}`, 'GET', null, token);

export const getUserDetails = (username, token) =>
    callApi(`/user/${username}`, 'GET', null, token);

export const updateUser = (username, data, token) =>
    callApi(`/user/${username}`, 'PUT', data, token);

export const deleteUser = (username, token) =>
    callApi(`/user/${username}`, 'DELETE', null, token);

// Message Endpoints
export const getMessagesBetween = (current_user, other_user, token) =>
    callApi(`/messages/${other_user}?current_user=${current_user}`, 'GET', null, token);

export const deleteMessage = (message_id, token) =>
    callApi(`/message/${message_id}`, 'DELETE', null, token);

// Phone Verification Endpoints (from verification_routes.py)
export const checkPhone = (phone) =>
    callApi('/check-phone', 'POST', { phone });

export const requestOtp = (phone, email = null) =>
    callApi('/request-otp', 'POST', { phone, email });

export const verifyOtp = (phone, otp, username = null, language = null, email = null) =>
    callApi('/verify-otp', 'POST', { phone, otp, username, language, email });
