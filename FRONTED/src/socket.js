import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BASE_URL;

const socket = io(URL, {
    transports: ['websocket']
});

export default socket;