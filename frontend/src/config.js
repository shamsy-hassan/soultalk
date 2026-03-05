// frontend/src/config.js
const DEV_BACKEND_URL = 'http://localhost:5000';
const PROD_BACKEND_URL = 'https://soultalk-u142.onrender.com';

const configuredBackendUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const fallbackBackendUrl = import.meta.env.PROD ? PROD_BACKEND_URL : DEV_BACKEND_URL;

export const BACKEND_BASE_URL = (configuredBackendUrl || fallbackBackendUrl).replace(/\/+$/, '');
export const SOCKET_URL = BACKEND_BASE_URL;
