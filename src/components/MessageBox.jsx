'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Info, Phone, Video, MoreHorizontal, Smile, Image, Heart, ChevronLeft } from 'lucide-react';
import { fetchMessagesRequest, sendMessageRequest, clearAllTypingUsers } from '../redux/features/message/messageSlice';
import { getSocket } from '../utils/socket';
import EmojiPicker from './Common/EmojiPicker';

export default function MessageBox({ chat, onBack }) {
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
    }, [selectedConversationId, loading, messages.length, scrollToBottom, loadingMore]);

    // Tự động cuộn xuống khi có tin nhắn mới (không phải khi đang tải thêm tin nhắn cũ)
    const previousMessagesLengthRef = useRef(0);

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
    }, [messages, loadingMore, isCurrentUser, scrollToBottom]);

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

    if (!chat) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-black relative">
            {/* Header */}
            <div className="h-[75px] px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:opacity-70 transition-opacity">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="relative">
                        <img
                            src={chat.avatar || '/placeholder.svg'}
                            alt={chat.username}
                            className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight">{chat.username}</span>
                        <span className="text-[11px] text-gray-500 leading-tight">Active 5m ago</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:opacity-70 transition-opacity"><Phone size={22} /></button>
                    <button className="p-2 hover:opacity-70 transition-opacity"><Video size={24} /></button>
                    <button className="p-2 hover:opacity-70 transition-opacity"><Info size={24} /></button>
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMore && <div className="text-center text-gray-400 text-[10px] py-2 uppercase tracking-wider font-semibold">Loading more messages...</div>}
                {messages.map((msg, index) => {
                    const fromMe = isCurrentUser(msg.senderId);
                    const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== msg.senderId;

                    return (
                        <div key={msg.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group max-w-[85%] ${fromMe ? 'ml-auto' : 'mr-auto'}`}>
                            {!fromMe && (
                                <div className="w-7 h-7 flex-shrink-0 mt-auto mr-2">
                                    {isLastInGroup && (
                                        <img src={chat.avatar || '/placeholder.svg'} className="w-full h-full rounded-full object-cover" />
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <div
                                    className={`px-3.5 py-2 text-sm break-words relative transition-all duration-200 ${fromMe
                                            ? 'bg-ig-primary text-white rounded-[18px] rounded-br-[4px]'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white rounded-[18px] rounded-bl-[4px]'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap break-words break-all">{msg.content}</p>
                                </div>
                                {isLastInGroup && (
                                    <span className={`text-[10px] text-gray-500 mt-1 ${fromMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {typingUsers.length > 0 && (
                    <div className="flex justify-start items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200">
                            <img src={chat.avatar || '/placeholder.svg'} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-1 h-8">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 flex-shrink-0">
                <form onSubmit={handleSend} className="relative flex items-center min-h-[44px] border border-gray-200 dark:border-zinc-800 rounded-full px-4 gap-2 focus-within:border-gray-400 transition-colors">
                    <EmojiPicker
                        onEmojiSelect={(emoji) => setMessage(message + emoji)}
                        placement="top-start"
                        className="text-black dark:text-white"
                    />
                    <textarea
                        rows={1}
                        placeholder="Message..."
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm resize-none py-2 max-h-32"
                    />
                    {message.trim() ? (
                        <button
                            type="submit"
                            className="text-ig-primary font-semibold text-sm px-2 hover:opacity-70 transition-opacity"
                        >
                            Send
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button type="button" className="hover:opacity-70 transition-opacity"><Image size={24} /></button>
                            <button type="button" className="hover:opacity-70 transition-opacity"><Heart size={24} /></button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
