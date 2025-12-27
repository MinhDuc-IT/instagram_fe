import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
    fetchNotificationsRequest,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    loadMoreNotificationsRequest,
    loadMoreNotificationsSuccess,
    loadMoreNotificationsFailure,
    markAsReadRequest,
    markAsReadSuccess,
    markAsReadFailure,
    markAllAsReadRequest,
    markAllAsReadSuccess,
    markAllAsReadFailure,
} from './notificationSlice';
import { getNotificationsApi, markAsReadApi, markAllAsReadApi } from '../../../service/notificationService';
import { RootState } from '../../store';

// Fetch notifications
function* handleFetchNotifications(): Generator<any, void, any> {
    try {
        // Axios interceptor đã extract response.data, nên response trả về trực tiếp là data
        // Response format: { notifications, hasMore, total, unreadCount }
        const data: any = yield call(getNotificationsApi, 20, 0);

        if (!data || !Array.isArray(data.notifications)) {
            throw new Error('Invalid response format: missing notifications array');
        }

        // Log để debug postId và commentId
        console.log('📬 Fetched notifications:', data.notifications);
        data.notifications.forEach((notif: any) => {
            if (notif.type === 'like' || notif.type === 'comment_like') {
                console.log(`📬 Notification ${notif.id} (${notif.type}):`, {
                    postId: notif.postId,
                    commentId: notif.commentId,
                    type: notif.type,
                });
            }
        });

        yield put(
            fetchNotificationsSuccess({
                notifications: data.notifications,
                hasMore: data.hasMore ?? false,
                total: data.total ?? 0,
                unreadCount: data.unreadCount ?? 0,
            }),
        );
    } catch (error: any) {
        console.error('Fetch notifications failed:', error);
        yield put(
            fetchNotificationsFailure(error.response?.data?.message || error.message || 'Không thể tải thông báo'),
        );
    }
}

// Load more notifications
function* handleLoadMoreNotifications(): Generator<any, void, any> {
    try {
        const state: RootState = yield select();
        const { offset } = state.notification;

        // Axios interceptor đã extract response.data, nên response trả về trực tiếp là data
        // Response format: { notifications, hasMore, total, unreadCount }
        const data: any = yield call(getNotificationsApi, 20, offset);

        if (!data || !Array.isArray(data.notifications)) {
            throw new Error('Invalid response format: missing notifications array');
        }

        yield put(
            loadMoreNotificationsSuccess({
                notifications: data.notifications,
                hasMore: data.hasMore ?? false,
            }),
        );
    } catch (error: any) {
        console.error('Load more notifications failed:', error);
        yield put(
            loadMoreNotificationsFailure(
                error.response?.data?.message || error.message || 'Không thể tải thêm thông báo',
            ),
        );
    }
}

// Mark notification as read
function* handleMarkAsRead(action: ReturnType<typeof markAsReadRequest>) {
    try {
        const notificationId = action.payload;
        yield call(markAsReadApi, notificationId);
        yield put(markAsReadSuccess(notificationId));
    } catch (error: any) {
        console.error('Mark as read failed:', error);
        yield put(markAsReadFailure(error.response?.data?.message || 'Không thể đánh dấu đã đọc'));
    }
}

// Mark all as read
function* handleMarkAllAsRead() {
    try {
        yield call(markAllAsReadApi);
        yield put(markAllAsReadSuccess());
    } catch (error: any) {
        console.error('Mark all as read failed:', error);
        yield put(markAllAsReadFailure(error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc'));
    }
}

export function* notificationSaga() {
    yield takeEvery(fetchNotificationsRequest.type, handleFetchNotifications);
    yield takeEvery(loadMoreNotificationsRequest.type, handleLoadMoreNotifications);
    yield takeEvery(markAsReadRequest.type, handleMarkAsRead);
    yield takeEvery(markAllAsReadRequest.type, handleMarkAllAsRead);
}
