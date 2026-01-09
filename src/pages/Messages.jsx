'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { MessageCircle } from 'lucide-react';

export default function Messages() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { conversations, loading, error } = useSelector((state) => state.message);
    const { profileUser } = useSelector((state) => state.users);
    const currentUser = useSelector((state) => state.auth.user);
    const [selectedChat, setSelectedChat] = useState(null);

    // Resizing logic
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const savedWidth = localStorage.getItem('chatSidebarWidth');
        return savedWidth ? parseInt(savedWidth, 10) : 398;
    });
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });
    const isResizing = useRef(false);

    // Update isMobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startResizing = useCallback((e) => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;

        // Calculate the new width based on mouse position relative to the container
        // We use a simpler approach since the container is max-width and centered
        // We can get the offset of the container to be more precise
        const container = document.getElementById('messages-container');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        let newWidth = e.clientX - containerRect.left;

        // Constraints
        if (newWidth < 250) newWidth = 250;
        if (newWidth > 600) newWidth = 600;

        setSidebarWidth(newWidth);
        localStorage.setItem('chatSidebarWidth', newWidth.toString());
    }, []);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, [handleMouseMove, stopResizing]);

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
        <div
            id="messages-container"
            className="h-[calc(100vh-0px)] flex bg-white dark:bg-black overflow-hidden border-x border-gray-200 dark:border-zinc-800 max-w-[1500px] mx-auto"
        >
            {/* Danh sách cuộc trò chuyện */}
            <div
                className={`flex-shrink-0 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}
                style={{ width: !isMobile ? `${sidebarWidth}px` : '100%' }}
            >
                {loading && conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Đang tải...</div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : (
                    <ChatList
                        chats={transformedChats}
                        selectedChat={selectedChat}
                        onSelectChat={handleSelectChat}
                        currentUser={currentUser}
                    />
                )}
            </div>

            {/* Resize Divider */}
            <div
                onMouseDown={startResizing}
                className="hidden md:block w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-ig-primary/30 transition-all duration-200 relative z-10"
            >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gray-200 dark:border-zinc-800" />
            </div>

            {/* Hộp tin nhắn */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-black ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <MessageBox chat={selectedChat} onBack={() => setSelectedChat(null)} />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center max-w-sm">
                            <div className="w-24 h-24 rounded-full border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-normal mb-2">Your Messages</h3>
                            <p className="text-gray-500 text-sm">
                                Send private photos and messages to a friend or group.
                            </p>
                            {/* <button className="mt-6 bg-ig-primary text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:opacity-90 transition">
                                Send message
                            </button> */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
