'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { fetchMessagesRequest, sendMessageRequest, clearAllTypingUsers } from '../redux/features/message/messageSlice';
import { getSocket } from '../utils/socket';
import EmojiPicker from './Common/EmojiPicker';

export default function MessageBox({ chat }) {
    const dispatch = useDispatch();
    const { messages, loading, loadingMore, hasMoreMessages, selectedConversationId, typingUsers } = useSelector(
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
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    // Hàm kiểm tra xem tin nhắn có phải từ user hiện tại không
    const isCurrentUser = useCallback(
        (senderId) => {
            return user?.id && senderId === user.id.toString();
        },
        [user],
    );

    // Hàm cuộn xuống cuối
    const scrollToBottom = useCallback((instant = false) => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            if (instant) {
                // Cuộn tức thời (dùng cho trường hợp đặc biệt)
                container.scrollTop = container.scrollHeight;
            } else {
                // Cuộn mượt mà
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    }, []);

    // Tải thêm tin nhắn khi cuộn lên đầu
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || isLoadingMoreRef.current || !hasMoreMessages || loadingMore) {
            return;
        }

        const container = messagesContainerRef.current;
        const scrollTop = container.scrollTop;

        // Kích hoạt tải thêm khi cuộn đến đầu (trong vòng 100px)
        if (scrollTop < 100 && hasMoreMessages && !loadingMore) {
            isLoadingMoreRef.current = true;
            previousScrollHeightRef.current = container.scrollHeight;
            shouldScrollToBottomRef.current = false; // Không cuộn xuống cuối khi đang tải thêm
            dispatch(fetchMessagesRequest({ conversationId: selectedConversationId, reset: false }));
        }
    }, [hasMoreMessages, loadingMore, selectedConversationId, dispatch]);

    // Duy trì vị trí cuộn sau khi tải thêm tin nhắn
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

    // Cuộn xuống cuối khi cuộc hội thoại thay đổi (tải lần đầu)
    useEffect(() => {
        const conversationChanged = previousConversationIdRef.current !== selectedConversationId;

        if (conversationChanged && selectedConversationId) {
            previousConversationIdRef.current = selectedConversationId;
            shouldScrollToBottomRef.current = true; // Đánh dấu cần cuộn xuống cuối
            isLoadingMoreRef.current = false; // Đặt lại cờ tải thêm
        }

        // Cuộn xuống cuối khi tin nhắn được tải và là lần tải đầu tiên (không phải tải thêm)
        if (
            shouldScrollToBottomRef.current &&
            messages.length > 0 &&
            !loading &&
            !loadingMore &&
            !isLoadingMoreRef.current &&
            messagesContainerRef.current
        ) {
            // Đợi DOM cập nhật, sau đó cuộn xuống cuối tức thời (không smooth)
            const timer = setTimeout(() => {
                scrollToBottom(true);
                shouldScrollToBottomRef.current = false;
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [selectedConversationId, loading, messages.length]);

    // Tự động cuộn xuống khi có tin nhắn mới (không phải khi đang tải thêm tin nhắn cũ)
    const previousMessagesLengthRef = useRef(0);
    const previousMessagesRef = useRef([]);

    useEffect(() => {
        if (
            messagesContainerRef.current &&
            !loadingMore &&
            !isLoadingMoreRef.current &&
            messages.length > previousMessagesLengthRef.current
        ) {
            const container = messagesContainerRef.current;

            // Tính toán khoảng cách từ cuối trang (threshold lớn hơn để dễ phát hiện)
            const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
            const isNearBottom = scrollBottom < 150; // Tăng threshold lên 150px

            // Lấy tin nhắn mới nhất
            const lastMessage = messages[messages.length - 1];
            const isFromCurrentUser = lastMessage && isCurrentUser(lastMessage.senderId);

            // Cuộn xuống nếu:
            // 1. Tin nhắn là từ user hiện tại (người gửi) - luôn cuộn
            // 2. Hoặc người nhận đang ở gần cuối trang (trong vòng 150px)
            if (isFromCurrentUser || isNearBottom) {
                // Đợi DOM cập nhật, sau đó cuộn xuống cuối với smooth scroll
                const timer = setTimeout(() => {
                    scrollToBottom(false);
                }, 100); // Giảm timeout một chút vì smooth scroll tự động xử lý animation

                return () => clearTimeout(timer);
            }
        }

        previousMessagesLengthRef.current = messages.length;
        previousMessagesRef.current = messages;
    }, [messages, loading, loadingMore, isCurrentUser]);

    // Đặt lại cờ tải thêm khi loadingMore thay đổi
    useEffect(() => {
        if (!loadingMore) {
            isLoadingMoreRef.current = false;
        }
    }, [loadingMore]);

    // Xử lý sự kiện đang gõ
    const handleTyping = useCallback(() => {
        // Chỉ gửi typing event nếu đã có conversationId
        if (!selectedConversationId) return;

        const socket = getSocket();
        if (!socket) return;

        // Phát sự kiện typing_start nếu chưa đang gõ
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit('typing_start', { conversationId: selectedConversationId });
        }

        // Xóa timeout hiện tại
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Phát sự kiện typing_stop sau 3 giây không gõ
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                socket.emit('typing_stop', { conversationId: selectedConversationId });
            }
        }, 3000);
    }, [selectedConversationId]);

    // Dừng trạng thái đang gõ khi gửi tin nhắn
    const stopTyping = useCallback(() => {
        // Chỉ gửi typing_stop nếu đã có conversationId
        if (!selectedConversationId) return;

        const socket = getSocket();
        if (!socket) return;

        if (isTypingRef.current) {
            isTypingRef.current = false;
            socket.emit('typing_stop', { conversationId: selectedConversationId });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [selectedConversationId]);

    // Xóa trạng thái đang gõ khi cuộc hội thoại thay đổi
    useEffect(() => {
        dispatch(clearAllTypingUsers());
        stopTyping();
        return () => {
            stopTyping();
        };
    }, [selectedConversationId, dispatch, stopTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Nếu có conversationId, gửi tin nhắn trong conversation
        // Nếu không có conversationId nhưng có userId (chat), gửi tin nhắn với recipientId
        if (selectedConversationId) {
            stopTyping();
            dispatch(sendMessageRequest({ conversationId: selectedConversationId, content: message }));
        } else if (chat?.userId) {
            stopTyping();
            dispatch(sendMessageRequest({ recipientId: chat.userId, content: message }));
        } else {
            return;
        }

        setMessage('');

        // Cuộn xuống cuối ngay sau khi gửi tin nhắn (trước khi tin nhắn được thêm vào state)
        // Logic cuộn chính sẽ được xử lý trong useEffect khi tin nhắn được thêm vào state
        setTimeout(() => {
            scrollToBottom(true);
        }, 50);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
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

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Tiêu đề */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <img
                    src={chat.avatar || '/placeholder.svg'}
                    alt={chat.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{chat.username}</span>
            </div>

            {/* Tin nhắn */}
            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMore && <div className="text-center text-gray-500 text-sm py-2">Đang tải thêm...</div>}
                {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Chưa có tin nhắn nào</div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={`${msg.id}-${msg.conversationId}-${index}`}
                            className={`flex ${isCurrentUser(msg.senderId) ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-2xl break-words ${isCurrentUser(msg.senderId)
                                    ? 'bg-ig-primary text-white'
                                    : 'bg-gray-200 dark:bg-gray-800'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
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
                {/* Chỉ báo đang gõ */}
                {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-800">
                            <div className="flex items-center gap-1">
                                {/* <p className="text-sm text-gray-500 italic">
                                    {typingUsers.length === 1
                                        ? `${typingUsers[0].username} `
                                        : `${typingUsers.length} người `}
                                </p> */}
                                <div className="flex items-center gap-1">
                                    <span className="typing-dot typing-dot-1" />
                                    <span className="typing-dot typing-dot-2" />
                                    <span className="typing-dot typing-dot-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 relative">
                    <EmojiPicker
                        onEmojiSelect={(emoji) => setMessage(message + emoji)}
                        placement="top-start"
                        className="p-2"
                    />
                    <input
                        type="text"
                        placeholder="Message..."
                        value={message}
                        onChange={handleMessageChange}
                        className="flex-1 input-field"
                        disabled={!selectedConversationId && !chat?.userId}
                    />
                    <button type="button" className="p-2 hover:text-gray-500 transition-colors">
                        <Heart className="w-6 h-6" />
                    </button>
                    <button
                        type="submit"
                        disabled={!message.trim() || loading || (!selectedConversationId && !chat?.userId)}
                        className="text-ig-primary font-semibold disabled:opacity-50"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
    );
}
