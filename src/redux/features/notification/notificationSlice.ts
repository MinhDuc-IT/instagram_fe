import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface cho notification
export interface Notification {
    id: number;
    receiverId: number;
    senderId: number;
    type: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    postId?: string;
    commentId?: number;
    sender?: {
        id: number;
        userName: string;
        fullName: string | null;
        avatar: string | null;
    };
}

// Notification state
export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;
    offset: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    total: 0,
    offset: 0,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        // Fetch notifications
        fetchNotificationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchNotificationsSuccess: (
            state,
            action: PayloadAction<{
                notifications: Notification[];
                hasMore: boolean;
                total: number;
                unreadCount: number;
            }>,
        ) => {
            state.notifications = action.payload.notifications;
            state.hasMore = action.payload.hasMore;
            state.total = action.payload.total;
            state.unreadCount = action.payload.unreadCount;
            state.loading = false;
            state.offset = action.payload.notifications.length;
        },
        fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Load more notifications
        loadMoreNotificationsRequest: (state) => {
            state.loadingMore = true;
            state.error = null;
        },
        loadMoreNotificationsSuccess: (
            state,
            action: PayloadAction<{
                notifications: Notification[];
                hasMore: boolean;
            }>,
        ) => {
            // Lọc bỏ các notification đã tồn tại (tránh duplicate)
            const existingIds = new Set(state.notifications.map((n) => n.id));
            const newNotifications = action.payload.notifications.filter((n) => !existingIds.has(n.id));

            // Thêm vào cuối danh sách (notifications cũ hơn)
            state.notifications = [...state.notifications, ...newNotifications];
            state.hasMore = action.payload.hasMore;
            state.loadingMore = false;
            state.offset = state.notifications.length;
        },
        loadMoreNotificationsFailure: (state, action: PayloadAction<string>) => {
            state.loadingMore = false;
            state.error = action.payload;
        },

        // Add new notification (from socket)
        addNotification: (state, action: PayloadAction<Notification>) => {
            // Kiểm tra xem notification đã tồn tại chưa (tránh duplicate)
            const existingIndex = state.notifications.findIndex((n) => n.id === action.payload.id);

            if (existingIndex === -1) {
                // Nếu chưa tồn tại, thêm vào đầu danh sách
                state.notifications = [action.payload, ...state.notifications];
                // Chỉ tăng unreadCount nếu notification chưa đọc
                if (!action.payload.isRead) {
                    state.unreadCount += 1;
                }
                state.total += 1;
            } else {
                // Nếu đã tồn tại, cập nhật notification (có thể có thay đổi về isRead, etc.)
                state.notifications[existingIndex] = action.payload;
            }
        },

        // Update unread count
        updateUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },

        // Mark notification as read
        markAsReadRequest: (state, _action: PayloadAction<number>) => {
            // Không cần set loading, chỉ cập nhật UI ngay
        },
        markAsReadSuccess: (state, action: PayloadAction<number>) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAsReadFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        // Mark all as read
        markAllAsReadRequest: (state) => {
            // Không cần set loading
        },
        markAllAsReadSuccess: (state) => {
            state.notifications = state.notifications.map((n) => ({
                ...n,
                isRead: true,
            }));
            state.unreadCount = 0;
        },
        markAllAsReadFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        // Reset state
        resetNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.offset = 0;
            state.hasMore = false;
            state.total = 0;
        },
    },
});

export const {
    fetchNotificationsRequest,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    loadMoreNotificationsRequest,
    loadMoreNotificationsSuccess,
    loadMoreNotificationsFailure,
    addNotification,
    updateUnreadCount,
    markAsReadRequest,
    markAsReadSuccess,
    markAsReadFailure,
    markAllAsReadRequest,
    markAllAsReadSuccess,
    markAllAsReadFailure,
    resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
