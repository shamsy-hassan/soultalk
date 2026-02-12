// frontend/src/socket.js

import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socketInstance = null;

export const initSocket = (username) => {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(SOCKET_URL, {
    transports: ['websocket'], // 🔥 force websocket (more stable)
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: true
  });

  socketInstance.on('connect', () => {
    console.log('✅ Connected to WebSocket server:', socketInstance.id);

    if (username) {
      console.log(`📢 Joining room as ${username}`);
      socketInstance.emit('join', { username });
    }
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('❌ Disconnected from WebSocket server:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('🚨 Connection error:', error);
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default initSocket;
