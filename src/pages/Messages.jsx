'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConversationsRequest,
    selectConversation,
    fetchMessagesRequest,
    markAsReadRequest,
} from '../redux/features/message/messageSlice';
import { useSocket } from '../hooks/useSocket';
import ChatList from '../components/ChatList';
import MessageBox from '../components/MessageBox';

export default function Messages() {
    const dispatch = useDispatch();
    const { conversations, loading, error } = useSelector((state) => state.message);
    const [selectedChat, setSelectedChat] = useState(null);

    // Khởi tạo kết nối socket
    useSocket();

    useEffect(() => {
        // Lấy danh sách cuộc hội thoại khi component được mount
        dispatch(fetchConversationsRequest());
    }, [dispatch]);

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
