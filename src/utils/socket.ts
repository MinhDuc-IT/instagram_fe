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

        // Loại bỏ dấu gạch chéo ở cuối nếu có
        const cleanBaseURL = baseURL.replace(/\/$/, '');

        // Kết nối đến namespace /messages - namespace là một phần của URL
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
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected. Reason:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('⚠️ Socket connection error:', error);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
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
