import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
    if (!socket) {
        const state = store.getState();
        const accessToken = state.auth?.accessToken;

        if (!accessToken) {
            console.warn('No access token available for socket connection');
            return null;
        }

        const baseURL = (import.meta as any).env?.VITE_BASE_URL || 'http://localhost:8080';

        // Remove trailing slash if exists
        const cleanBaseURL = baseURL.replace(/\/$/, '');

        // Connect to namespace /messages - namespace is part of the URL
        socket = io(`${cleanBaseURL}/messages`, {
            auth: {
                token: accessToken,
            },
            query: {
                token: accessToken,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            forceNew: true,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const reconnectSocket = () => {
    disconnectSocket();
    return getSocket();
};
