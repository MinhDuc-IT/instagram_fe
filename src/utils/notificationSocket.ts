import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';

let notificationSocket: Socket | null = null;

export const getNotificationSocket = (): Socket | null => {
    if (!notificationSocket) {
        const state = store.getState();
        const accessToken = state.auth?.accessToken;

        if (!accessToken) {
            console.warn('No access token available for notification socket connection');
            return null;
        }

        const baseURL = (import.meta as any).env?.VITE_BASE_URL || 'http://localhost:8080';

        // Loại bỏ dấu gạch chéo ở cuối nếu có
        const cleanBaseURL = baseURL.replace(/\/$/, '');

        // Kết nối đến namespace /notifications
        notificationSocket = io(`${cleanBaseURL}/notifications`, {
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

        notificationSocket.on('connect', () => {
            console.log('✅ Notification socket connected:', notificationSocket?.id);
        });

        notificationSocket.on('disconnect', (reason) => {
            console.log('❌ Notification socket disconnected. Reason:', reason);
        });

        notificationSocket.on('connect_error', (error) => {
            console.error('⚠️ Notification socket connection error:', error);
        });

        notificationSocket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Notification socket reconnected after', attemptNumber, 'attempts');
        });
    }

    return notificationSocket;
};

export const disconnectNotificationSocket = () => {
    if (notificationSocket) {
        notificationSocket.disconnect();
        notificationSocket = null;
    }
};

export const reconnectNotificationSocket = () => {
    disconnectNotificationSocket();
    return getNotificationSocket();
};

