import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, disconnectSocket } from '../utils/socket';
import {
    addNewMessage,
    updateConversation,
    setTypingUser,
    clearTypingUser,
} from '../redux/features/message/messageSlice';
import { Message, Conversation } from '../redux/features/message/messageSlice';

export const useSocket = () => {
    const dispatch = useDispatch();
    const { selectedConversationId, conversations } = useSelector((state: any) => state.message);
    const { isAuthenticated, accessToken, user } = useSelector((state: any) => state.auth);
    const socketRef = useRef<any>(null);
    const joinedRoomsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            return;
        }

        const socket = getSocket();
        if (!socket) {
            return;
        }

        socketRef.current = socket;

        // Lắng nghe tin nhắn mới
        const handleNewMessage = (message: Message) => {
            console.log('New message received:', message);
            // Chỉ thêm tin nhắn nếu không phải từ người dùng hiện tại (để tránh trùng với sendMessageSuccess)
            // Hoặc nếu từ người dùng hiện tại nhưng không phải cuộc trò chuyện hiện tại (thiết bị/tab khác)
            const isFromCurrentUser = user?.id && message.senderId === user.id.toString();
            const isCurrentConversation = message.conversationId === selectedConversationId;

            // Thêm tin nhắn nếu:
            // 1. Không phải từ người dùng hiện tại (người khác gửi)
            // 2. Hoặc từ người dùng hiện tại nhưng không phải cuộc trò chuyện hiện tại (gửi từ thiết bị/tab khác)
            if (!isFromCurrentUser || !isCurrentConversation) {
                dispatch(addNewMessage(message));
            }
        };

        // Lắng nghe sự kiện đã đọc tin nhắn
        const handleMessagesRead = (data: { conversationId: string; userId: string; readCount: number }) => {
            console.log('Messages read:', data);
            // Cập nhật số lượng tin nhắn chưa đọc
            // Sẽ được xử lý bởi việc làm mới danh sách cuộc trò chuyện
        };

        // Lắng nghe sự kiện đang gõ
        const handleUserTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
            console.log('User typing:', data);
            // Bỏ qua nếu là từ người dùng hiện tại
            if (user?.id && data.userId === user.id.toString()) {
                return;
            }

            if (data.isTyping) {
                // Lấy thông tin người dùng từ danh sách cuộc trò chuyện
                const conversation = conversations?.find((c: Conversation) => c.id === data.conversationId);
                if (conversation) {
                    const typingUser = {
                        userId: data.userId,
                        username: conversation.participant.username,
                    };
                    dispatch(setTypingUser({ conversationId: data.conversationId, user: typingUser }));
                }
            } else {
                dispatch(clearTypingUser({ conversationId: data.conversationId, userId: data.userId }));
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);
        socket.on('user_typing', handleUserTyping);

        return () => {
            if (socket) {
                socket.off('new_message', handleNewMessage);
                socket.off('messages_read', handleMessagesRead);
                socket.off('user_typing', handleUserTyping);
            }
        };
    }, [isAuthenticated, accessToken, dispatch, selectedConversationId, conversations, user]);

    // Tham gia/rời khỏi phòng cuộc trò chuyện
    useEffect(() => {
        if (!socketRef.current || !selectedConversationId) {
            return;
        }

        const socket = socketRef.current;
        const room = selectedConversationId;

        // Rời khỏi các phòng trước đó
        joinedRoomsRef.current.forEach((prevRoom) => {
            if (prevRoom !== room) {
                socket.emit('leave_conversation', { conversationId: prevRoom });
                joinedRoomsRef.current.delete(prevRoom);
            }
        });

        // Tham gia cuộc trò chuyện hiện tại
        if (!joinedRoomsRef.current.has(room)) {
            socket.emit('join_conversation', { conversationId: room });
            joinedRoomsRef.current.add(room);
        }

        return () => {
            if (socket && selectedConversationId) {
                socket.emit('leave_conversation', { conversationId: selectedConversationId });
                joinedRoomsRef.current.delete(selectedConversationId);
            }
        };
    }, [selectedConversationId]);

    // Dọn dẹp khi component bị unmount
    useEffect(() => {
        return () => {
            // Không ngắt kết nối socket khi unmount, giữ kết nối sống
            // Chỉ ngắt kết nối khi người dùng đăng xuất
        };
    }, []);
};
