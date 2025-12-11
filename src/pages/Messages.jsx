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

    // Initialize socket connection
    useSocket();

    useEffect(() => {
        // Fetch conversations when component mounts
        dispatch(fetchConversationsRequest());
    }, [dispatch]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        if (chat?.id) {
            dispatch(selectConversation(chat.id));
            // Mark messages as read when selecting a conversation
            dispatch(markAsReadRequest(chat.id));
            // Fetch messages when selecting a conversation
            dispatch(fetchMessagesRequest({ conversationId: chat.id, reset: true }));
        }
    };

    // Transform conversations to match ChatList expected format
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
      {/* Chat List */}
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

      {/* Message Box */}
      <div className="hidden md:flex flex-1">
        <MessageBox chat={selectedChat} />
      </div>

      {/* Mobile Message Box */}
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
