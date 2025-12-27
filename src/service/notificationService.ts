import axios from '../utils/axiosCustomize';
import { AxiosResponse } from 'axios';
import { Notification } from '../redux/features/notification/notificationSlice';

// Get notifications with pagination
export const getNotificationsApi = (
    limit: number = 20,
    offset: number = 0,
): Promise<AxiosResponse<{
    notifications: Notification[];
    hasMore: boolean;
    total: number;
    unreadCount: number;
}>> => {
    return axios.get<{
        notifications: Notification[];
        hasMore: boolean;
        total: number;
        unreadCount: number;
    }>(`/notifications?limit=${limit}&offset=${offset}`);
};

// Mark notification as read
export const markAsReadApi = (notificationId: number): Promise<AxiosResponse<Notification>> => {
    return axios.post<Notification>(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsReadApi = (): Promise<AxiosResponse<{ success: boolean }>> => {
    return axios.post<{ success: boolean }>('/notifications/read-all');
};

