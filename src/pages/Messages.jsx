'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    fetchConversationsRequest,
    selectConversation,
    fetchMessagesRequest,
    markAsReadRequest,
} from '../redux/features/message/messageSlice';
import { fetchProfileUserRequest } from '../redux/features/user/userSlice';
import { useSocket } from '../hooks/useSocket';
import ChatList from '../components/ChatList';
import MessageBox from '../components/MessageBox';

export default function Messages() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { conversations, loading, error } = useSelector((state) => state.message);
    const { profileUser } = useSelector((state) => state.users);
    const [selectedChat, setSelectedChat] = useState(null);

    // Khởi tạo kết nối socket
    useSocket();

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        if (chat?.id) {
            dispatch(selectConversation(chat.id));
            // Đánh dấu tin nhắn là đã đọc khi chọn cuộc hội thoại
            dispatch(markAsReadRequest(chat.id));
            // Lấy tin nhắn khi chọn cuộc hội thoại
            dispatch(fetchMessagesRequest({ conversationId: chat.id, reset: true }));
        }
    };

    useEffect(() => {
        // Lấy danh sách cuộc hội thoại khi component được mount
        dispatch(fetchConversationsRequest());
    }, [dispatch]);

    // Tự động select conversation hoặc user nếu có conversationId hoặc userId trong query params
    useEffect(() => {
        const conversationId = searchParams.get('conversationId');
        const userId = searchParams.get('userId');

        if (conversationId && conversations.length > 0 && (!selectedChat || selectedChat.id !== conversationId)) {
            // Tìm conversation trong danh sách
            const conversation = conversations.find((conv) => conv.id === conversationId);
            if (conversation) {
                handleSelectChat({
                    id: conversation.id,
                    username: conversation.participant.username,
                    name: conversation.participant.fullName || conversation.participant.username,
                    avatar: conversation.participant.avatar,
                });
            }
        } else if (userId && (!selectedChat || selectedChat.userId !== userId)) {
            // Tìm conversation với user này trong danh sách
            const conversation = conversations.find((conv) => conv.participant.id === userId);

            if (conversation) {
                // Nếu đã có conversation, chọn nó
                handleSelectChat({
                    id: conversation.id,
                    username: conversation.participant.username,
                    name: conversation.participant.fullName || conversation.participant.username,
                    avatar: conversation.participant.avatar,
                });
            } else {
                // Nếu chưa có conversation, fetch user info và tạo chat object với userId
                const userIdNum = parseInt(userId, 10);
                if (!isNaN(userIdNum)) {
                    dispatch(fetchProfileUserRequest(userIdNum));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, conversations]);

    // Cập nhật selectedChat khi có profileUser (sau khi fetch user info)
    useEffect(() => {
        const userId = searchParams.get('userId');
        if (userId && profileUser && profileUser.id.toString() === userId) {
            // Kiểm tra xem đã có conversation chưa
            const conversation = conversations.find((conv) => conv.participant.id === userId);

            if (!conversation) {
                // Chưa có conversation, tạo chat object với userId
                setSelectedChat({
                    userId: userId,
                    id: null, // Chưa có conversationId
                    username: profileUser.username || '',
                    name: profileUser.fullName || profileUser.username || '',
                    avatar: profileUser.avatar || '',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileUser, conversations, searchParams]);

    // Chuyển đổi cuộc hội thoại để khớp với định dạng mong đợi của ChatList
    const transformedChats = conversations.map((conv) => ({
        id: conv.id,
        username: conv.participant.username,
        name: conv.participant.fullName || conv.participant.username,
        avatar: conv.participant.avatar,
        lastMessage: conv.lastMessage?.content || '',
        timestamp: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : '',
        unread: conv.unreadCount,
    }));

    return (
        <div className="h-screen flex">
            {/* Danh sách cuộc trò chuyện */}
            <div className="w-full md:w-96 flex-shrink-0">
                {loading && conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Đang tải...</div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : transformedChats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Chưa có cuộc trò chuyện nào</div>
                ) : (
                    <ChatList chats={transformedChats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
                )}
            </div>

            {/* Hộp tin nhắn */}
            <div className="hidden md:flex flex-1">
                <MessageBox chat={selectedChat} />
            </div>

            {/* Hộp tin nhắn trên mobile */}
            {selectedChat && (
                <div className="md:hidden fixed inset-0 bg-white dark:bg-black z-50">
                    <MessageBox chat={selectedChat} />
                    <button
                        onClick={() => setSelectedChat(null)}
                        className="absolute top-4 left-4 text-ig-primary font-semibold"
                    >
                        ← Back
                    </button>
                </div>
            )}
        </div>
    );
}
