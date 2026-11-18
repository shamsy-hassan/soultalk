import axios from 'axios';

const RETRY_DELAYS_MS = [1000, 2000, 4000];

const http = axios.create();

http.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const retryCount = config?._networkRetryCount || 0;
  const isRetryableGet = config?.method?.toLowerCase() === 'get'
    && error.code !== 'ERR_CANCELED'
    && (!error.response || error.response.status >= 500);

  if (!isRetryableGet || retryCount >= RETRY_DELAYS_MS.length) {
    return Promise.reject(error);
  }

  config._networkRetryCount = retryCount + 1;
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[retryCount]));
  return http.request(config);
});

export default http;
