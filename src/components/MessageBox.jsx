'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { fetchMessagesRequest, sendMessageRequest } from '../redux/features/message/messageSlice';

export default function MessageBox({ chat }) {
    const dispatch = useDispatch();
    const { messages, loading, loadingMore, hasMoreMessages, selectedConversationId } = useSelector(
        (state) => state.message,
    );
    const { user } = useSelector((state) => state.auth);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const previousScrollHeightRef = useRef(0);
    const isLoadingMoreRef = useRef(false);
    const previousConversationIdRef = useRef(null);
    const shouldScrollToBottomRef = useRef(false);

    // Scroll to bottom function
    const scrollToBottom = useCallback((instant = false) => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            // Scroll to bottom by setting scrollTop to scrollHeight
            container.scrollTop = container.scrollHeight;
        }
    }, []);

    // Load more messages when scrolling to top
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || isLoadingMoreRef.current || !hasMoreMessages || loadingMore) {
            return;
        }

        const container = messagesContainerRef.current;
        const scrollTop = container.scrollTop;

        // Trigger load more when scrolled to top (within 100px)
        if (scrollTop < 100 && hasMoreMessages && !loadingMore) {
            isLoadingMoreRef.current = true;
            previousScrollHeightRef.current = container.scrollHeight;
            shouldScrollToBottomRef.current = false; // Don't scroll to bottom when loading more
            dispatch(fetchMessagesRequest({ conversationId: selectedConversationId, reset: false }));
        }
    }, [hasMoreMessages, loadingMore, selectedConversationId, dispatch]);

    // Maintain scroll position after loading more messages
    useEffect(() => {
        if (messagesContainerRef.current && isLoadingMoreRef.current && previousScrollHeightRef.current > 0) {
            const container = messagesContainerRef.current;
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeightRef.current;
            container.scrollTop = scrollDifference;
            previousScrollHeightRef.current = 0;
            isLoadingMoreRef.current = false;
        }
    }, [messages]);

    // Scroll to bottom when conversation changes (initial load)
    useEffect(() => {
        const conversationChanged = previousConversationIdRef.current !== selectedConversationId;

        if (conversationChanged && selectedConversationId) {
            previousConversationIdRef.current = selectedConversationId;
            shouldScrollToBottomRef.current = true; // Mark that we should scroll to bottom
            isLoadingMoreRef.current = false; // Reset load more flag
        }

        // Scroll to bottom when messages are loaded and it's initial load (not load more)
        if (
            shouldScrollToBottomRef.current &&
            messages.length > 0 &&
            !loading &&
            !loadingMore &&
            !isLoadingMoreRef.current &&
            messagesContainerRef.current
        ) {
            // Wait for DOM to update, then scroll to bottom
            const timer = setTimeout(() => {
                if (messagesContainerRef.current) {
                    const container = messagesContainerRef.current;
                    // Force scroll to bottom
                    container.scrollTop = container.scrollHeight;
                    shouldScrollToBottomRef.current = false;
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [selectedConversationId, loading, messages.length]);

    // Reset loading more flag when loadingMore changes
    useEffect(() => {
        if (!loadingMore) {
            isLoadingMoreRef.current = false;
        }
    }, [loadingMore]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedConversationId) return;

        dispatch(sendMessageRequest({ conversationId: selectedConversationId, content: message }));
        setMessage('');
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <MessageCircle className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                    <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                    <p className="text-gray-500">Send private photos and messages to a friend or group.</p>
                </div>
            </div>
        );
    }

    const isCurrentUser = (senderId) => {
        return user?.id && senderId === user.id.toString();
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <img
                    src={chat.avatar || '/placeholder.svg'}
                    alt={chat.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{chat.username}</span>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMore && <div className="text-center text-gray-500 text-sm py-2">Đang tải thêm...</div>}
                {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Chưa có tin nhắn nào</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${isCurrentUser(msg.senderId) ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-full ${
                                    isCurrentUser(msg.senderId)
                                        ? 'bg-ig-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p
                                    className={`text-xs mt-1 ${isCurrentUser(msg.senderId) ? 'text-white/70' : 'text-gray-500'}`}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 input-field"
                    />
                    <button type="button" className="p-2 hover:text-gray-500 transition-colors">
                        <Heart className="w-6 h-6" />
                    </button>
                    <button
                        type="submit"
                        disabled={!message.trim() || loading}
                        className="text-ig-primary font-semibold disabled:opacity-50"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
    );
}
