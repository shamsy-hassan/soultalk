import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

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