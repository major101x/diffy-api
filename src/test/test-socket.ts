import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.emit('events', 'Hello from client');

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
