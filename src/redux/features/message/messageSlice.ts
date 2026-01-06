import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface cho cuộc trò chuyện
export interface Conversation {
    id: string;
    participant: {
        id: string;
        username: string;
        fullName?: string;
        avatar?: string;
    };
    lastMessage?: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
    };
    unreadCount: number;
    updatedAt: string;
}

// Interface cho tin nhắn
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// Interface cho người dùng đang gõ
export interface TypingUser {
    userId: string;
    username: string;
}

// Message state
export interface MessageState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    selectedConversationId: string | null;
    hasMoreMessages: boolean;
    messagesOffset: number;
    typingUsers: TypingUser[]; // Người dùng đang gõ trong cuộc trò chuyện được chọn
    totalUnreadMessages: number; // Tổng số unread messages (để hiển thị badge khi chưa fetch conversations)
}

const initialState: MessageState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    loadingMore: false,
    error: null,
    selectedConversationId: null,
    hasMoreMessages: false,
    messagesOffset: 0,
    typingUsers: [],
    totalUnreadMessages: 0,
};

// Slice
export const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        // Lấy danh sách cuộc trò chuyện
        fetchConversationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations = action.payload;
            // Cập nhật totalUnreadMessages từ conversations mới fetch
            state.totalUnreadMessages = action.payload.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            state.loading = false;
            state.error = null;
        },
        fetchConversationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Lấy tin nhắn cho một cuộc trò chuyện
        fetchMessagesRequest: (state, _action: PayloadAction<{ conversationId: string; reset?: boolean }>) => {
            const { reset } = _action.payload;
            if (reset) {
                state.loading = true;
                state.messages = [];
                state.messagesOffset = 0;
            } else {
                state.loadingMore = true;
            }
            state.error = null;
        },
        fetchMessagesSuccess: (
            state,
            action: PayloadAction<{ conversationId: string; messages: Message[]; hasMore: boolean; offset: number }>,
        ) => {
            const { conversationId, messages, hasMore, offset } = action.payload;
            if (state.messagesOffset === 0) {
                // Lần tải đầu hoặc reset
                state.messages = messages;
            } else {
                // Tải thêm - thêm tin nhắn cũ vào đầu, lọc trùng lặp
                const existingIds = new Set(state.messages.map((m) => m.id));
                const newMessages = messages.filter((m) => !existingIds.has(m.id));
                state.messages = [...newMessages, ...state.messages];
            }
            state.selectedConversationId = conversationId;
            state.hasMoreMessages = hasMore;
            state.messagesOffset = offset;
            state.loading = false;
            state.loadingMore = false;
            state.error = null;
        },
        fetchMessagesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.loadingMore = false;
            state.error = action.payload;
        },

        // Chọn cuộc trò chuyện
        selectConversation: (state, action: PayloadAction<string>) => {
            state.selectedConversationId = action.payload;
            state.messages = [];
            state.messagesOffset = 0;
            state.hasMoreMessages = false;
            state.typingUsers = []; // Xóa người dùng đang gõ khi chuyển cuộc trò chuyện
            const conversation = state.conversations.find((c) => c.id === action.payload);
            if (conversation) {
                state.currentConversation = conversation;
            }
        },

        // Gửi tin nhắn
        sendMessageRequest: (
            state,
            _action: PayloadAction<{ conversationId?: string; recipientId?: string; content: string }>,
        ) => {
            state.loading = true;
            state.error = null;
        },
        sendMessageSuccess: (state, action: PayloadAction<Message>) => {
            // Kiểm tra xem tin nhắn đã tồn tại chưa (từ socket) trước khi thêm
            const exists = state.messages.some((m) => m.id === action.payload.id);
            if (!exists) {
                state.messages.push(action.payload);
            }
            state.loading = false;
            state.error = null;
        },
        sendMessageFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Thêm tin nhắn mới (từ socket.io)
        addNewMessage: (state, action: PayloadAction<Message>) => {
            const message = action.payload;
            console.log(
                'addNewMessage - Updating conversation:',
                message.conversationId,
                'with message:',
                message.content,
            );

            // Thêm vào tin nhắn nếu thuộc cuộc trò chuyện hiện tại và chưa tồn tại
            if (message.conversationId === state.selectedConversationId) {
                const exists = state.messages.some((m) => m.id === message.id);
                if (!exists) {
                    state.messages.push(message);
                }
            }

            // Luôn cập nhật tin nhắn cuối của cuộc trò chuyện và di chuyển lên đầu (cho tất cả conversation)
            const conversationIndex = state.conversations.findIndex((c) => c.id === message.conversationId);
            if (conversationIndex !== -1) {
                const conversation = state.conversations[conversationIndex];
                console.log(
                    'addNewMessage - Before update, conversation.lastMessage:',
                    conversation.lastMessage?.content,
                );

                // Tạo conversation mới với lastMessage được cập nhật để đảm bảo React nhận biết thay đổi
                const updatedConversation = {
                    ...conversation,
                    lastMessage: {
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        createdAt: message.createdAt,
                    },
                    updatedAt: message.createdAt,
                };

                console.log(
                    'addNewMessage - After update, updatedConversation.lastMessage:',
                    updatedConversation.lastMessage?.content,
                );

                // Di chuyển cuộc trò chuyện lên đầu
                const updatedConversations = [...state.conversations];
                updatedConversations.splice(conversationIndex, 1);
                state.conversations = [updatedConversation, ...updatedConversations];

                console.log(
                    'addNewMessage - After reorder, first conversation lastMessage:',
                    state.conversations[0]?.lastMessage?.content,
                );
            } else {
                console.warn('addNewMessage - Conversation not found:', message.conversationId);
            }
        },

        // Cập nhật cuộc trò chuyện (từ socket.io)
        updateConversation: (state, action: PayloadAction<Conversation>) => {
            const index = state.conversations.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = action.payload;
            } else {
                state.conversations.unshift(action.payload);
            }
        },

        // Đánh dấu tin nhắn đã đọc
        markAsReadRequest: (state, _action: PayloadAction<string>) => {
            // Không cần trạng thái loading cho hành động này
        },
        markAsReadSuccess: (state, action: PayloadAction<{ conversationId: string; readCount: number }>) => {
            // Cập nhật số lượng tin nhắn chưa đọc trong cuộc trò chuyện
            const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
            if (conversation) {
                conversation.unreadCount = Math.max(0, conversation.unreadCount - action.payload.readCount);
                // Cập nhật totalUnreadMessages
                state.totalUnreadMessages = state.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            }
        },
        markAsReadFailure: (state, _action: PayloadAction<string>) => {
            // Lỗi im lặng, không hiển thị lỗi
        },

        // Xóa tin nhắn
        clearMessages: (state) => {
            state.messages = [];
            state.selectedConversationId = null;
            state.currentConversation = null;
            state.messagesOffset = 0;
            state.hasMoreMessages = false;
            state.typingUsers = [];
        },

        // Đặt người dùng đang gõ
        setTypingUser: (state, action: PayloadAction<{ conversationId: string; user: TypingUser }>) => {
            if (action.payload.conversationId === state.selectedConversationId) {
                const exists = state.typingUsers.some((u) => u.userId === action.payload.user.userId);
                if (!exists) {
                    state.typingUsers.push(action.payload.user);
                }
            }
        },

        // Xóa người dùng đang gõ
        clearTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
            if (action.payload.conversationId === state.selectedConversationId) {
                state.typingUsers = state.typingUsers.filter((u) => u.userId !== action.payload.userId);
            }
        },

        // Xóa tất cả người dùng đang gõ (khi cuộc trò chuyện thay đổi)
        clearAllTypingUsers: (state) => {
            state.typingUsers = [];
        },

        // Tăng unread count cho conversation khi nhận message notification
        incrementConversationUnreadCount: (state, action: PayloadAction<{ conversationId: string }>) => {
            const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
            if (conversation) {
                conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                // Cập nhật totalUnreadMessages
                state.totalUnreadMessages = state.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            } else {
                // Nếu conversation chưa có trong state (chưa fetch conversations), tăng totalUnreadMessages
                state.totalUnreadMessages = (state.totalUnreadMessages || 0) + 1;
            }
        },

        // Cập nhật conversation từ notification (cập nhật updatedAt và di chuyển lên đầu)
        // Được gọi khi nhận new_message_notification (không có message data đầy đủ)
        updateConversationFromNotification: (
            state,
            action: PayloadAction<{ conversationId: string; timestamp: string }>,
        ) => {
            const conversationIndex = state.conversations.findIndex((c) => c.id === action.payload.conversationId);
            if (conversationIndex !== -1) {
                const conversation = state.conversations[conversationIndex];
                // Cập nhật updatedAt để conversation được sắp xếp lại
                conversation.updatedAt = action.payload.timestamp;

                // Di chuyển conversation lên đầu
                const updatedConversations = [...state.conversations];
                updatedConversations.splice(conversationIndex, 1);
                state.conversations = [conversation, ...updatedConversations];
            }
        },
    },
});

export const {
    fetchConversationsRequest,
    fetchConversationsSuccess,
    fetchConversationsFailure,
    fetchMessagesRequest,
    fetchMessagesSuccess,
    fetchMessagesFailure,
    selectConversation,
    sendMessageRequest,
    sendMessageSuccess,
    sendMessageFailure,
    markAsReadRequest,
    markAsReadSuccess,
    markAsReadFailure,
    addNewMessage,
    updateConversation,
    clearMessages,
    setTypingUser,
    clearTypingUser,
    clearAllTypingUsers,
    incrementConversationUnreadCount,
    updateConversationFromNotification,
} = messageSlice.actions;

export default messageSlice.reducer;
