import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

export const initSocket = (username) => {
  const socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    if (username) {
      socket.emit('join', { username });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  return socket;
};

export default initSocket;
