import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationSocket, disconnectNotificationSocket } from '../utils/notificationSocket';
import { addNotification, updateUnreadCount } from '../redux/features/notification/notificationSlice';
import { Notification } from '../redux/features/notification/notificationSlice';
import { incrementConversationUnreadCount } from '../redux/features/message/messageSlice';
import { toast } from 'react-toastify';

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, accessToken } = useSelector((state: any) => state.auth);
    const { selectedConversationId } = useSelector((state: any) => state.message);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            return;
        }

        const socket = getNotificationSocket();
        if (!socket) {
            console.warn('⚠️ Notification socket is null');
            return;
        }

        socketRef.current = socket;

        // Kiểm tra socket connection
        if (socket.connected) {
            console.log('✅ Notification socket is already connected:', socket.id);
        } else {
            console.log('⏳ Notification socket connecting...');
            socket.once('connect', () => {
                console.log('✅ Notification socket connected:', socket.id);
            });
        }

        // Lắng nghe notification mới
        const handleNewNotification = (notification: any) => {
            console.log('🔔 New notification received:', notification);
            console.log('🔔 Notification type:', typeof notification);
            console.log('🔔 Notification keys:', Object.keys(notification || {}));

            // Validate notification format
            if (!notification || !notification.id) {
                console.error('❌ Invalid notification format:', notification);
                return;
            }

            // Filter bỏ notification type = 'message' (message notifications được xử lý riêng)
            if (notification.type === 'message') {
                console.log('💬 Skipping message notification (handled separately)');
                return;
            }

            // Convert to proper format if needed
            const formattedNotification: Notification = {
                id: notification.id,
                receiverId: notification.receiverId,
                senderId: notification.senderId,
                type: notification.type,
                content: notification.content,
                isRead: notification.isRead || false,
                createdAt: notification.createdAt || new Date().toISOString(),
                postId: notification.postId,
                commentId: notification.commentId,
                sender: notification.sender,
            };

            console.log('🔔 Formatted notification:', formattedNotification);
            dispatch(addNotification(formattedNotification));

            // Hiển thị toast notification
            const senderName =
                formattedNotification.sender?.fullName || formattedNotification.sender?.userName || 'Ai đó';
            toast.info(`${senderName}: ${formattedNotification.content}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        // Lắng nghe unread count update
        const handleUnreadCount = (data: { count: number }) => {
            console.log('📊 Unread count updated:', data.count);
            dispatch(updateUnreadCount(data.count));
        };

        // Lắng nghe message notification (cập nhật conversation và tăng unread count)
        const handleMessageNotification = async (data: {
            type: string;
            senderId: number;
            senderName: string;
            conversationId: number;
            timestamp: string;
        }) => {
            console.log('💬 Message notification received:', data);

            const conversationIdStr = data.conversationId.toString();

            // Chỉ tăng unread count nếu KHÔNG đang mở cuộc hội thoại này
            // Nếu đang mở, tin nhắn sẽ được tự động mark as read trong useSocket
            const isCurrentConversation = selectedConversationId === conversationIdStr;

            if (!isCurrentConversation) {
                // Tăng unread count cho conversation tương ứng
                dispatch(incrementConversationUnreadCount({ conversationId: conversationIdStr }));
            }

            // - Backend đã emit 'new_message' đến user rooms (tất cả users trong conversation)
            // - useSocket sẽ nhận 'new_message' event và dispatch addNewMessage
            // - addNewMessage sẽ tự động cập nhật lastMessage, updatedAt và pin conversation lên đầu

            // Hiển thị toast notification (badge ở góc trên bên phải)
            // KHÔNG thêm vào notification list và KHÔNG tăng unreadCount của notifications
            toast.info(`${data.senderName} đã gửi cho bạn một tin nhắn`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        // Listen tất cả events để debug
        socket.onAny((event, ...args) => {
            console.log('📡 Notification socket event:', event, args);
        });

        socket.on('new_notification', handleNewNotification);
        socket.on('unread_count', handleUnreadCount);
        socket.on('new_message_notification', handleMessageNotification);

        return () => {
            if (socket) {
                socket.off('new_notification', handleNewNotification);
                socket.off('unread_count', handleUnreadCount);
                socket.off('new_message_notification', handleMessageNotification);
            }
        };
    }, [isAuthenticated, accessToken, dispatch, selectedConversationId]);

    // Dọn dẹp khi component bị unmount (chỉ khi logout)
    useEffect(() => {
        return () => {
            // Không ngắt kết nối socket khi unmount, giữ kết nối sống
            // Chỉ ngắt kết nối khi người dùng đăng xuất
        };
    }, []);
};
