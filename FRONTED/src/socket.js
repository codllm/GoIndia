import { io } from 'socket.io-client';


const URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3060';

export const socket = io(URL, {
    transports: ['websocket'],
    autoConnect: true,
});


socket.on('connect', () => {
    console.log('Connected to backend at:', URL);
});

socket.on('connect_error', (err) => {
    console.log('Socket Connection Error:', err.message);
});