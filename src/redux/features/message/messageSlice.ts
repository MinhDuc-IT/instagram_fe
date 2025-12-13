import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Conversation interface
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

// Message interface
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// Typing user interface
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
    typingUsers: TypingUser[]; // Users currently typing in selected conversation
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
};

// Slice
export const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        // Fetch conversations
        fetchConversationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchConversationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetch messages for a conversation
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
        fetchMessagesSuccess: (state, action: PayloadAction<{ conversationId: string; messages: Message[]; hasMore: boolean; offset: number }>) => {
            const { conversationId, messages, hasMore, offset } = action.payload;
            if (state.messagesOffset === 0) {
                // First load or reset
                state.messages = messages;
            } else {
                // Load more - prepend old messages, filter duplicates
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

        // Select conversation
        selectConversation: (state, action: PayloadAction<string>) => {
            state.selectedConversationId = action.payload;
            state.messages = [];
            state.messagesOffset = 0;
            state.hasMoreMessages = false;
            state.typingUsers = []; // Clear typing users when switching conversation
            const conversation = state.conversations.find((c) => c.id === action.payload);
            if (conversation) {
                state.currentConversation = conversation;
            }
        },

        // Send message
        sendMessageRequest: (state, _action: PayloadAction<{ conversationId: string; content: string }>) => {
            state.loading = true;
            state.error = null;
        },
        sendMessageSuccess: (state, action: PayloadAction<Message>) => {
            // Check if message already exists (from socket) before adding
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

        // Add new message (from socket.io)
        addNewMessage: (state, action: PayloadAction<Message>) => {
            const message = action.payload;
            // Add to messages if it's for current conversation and not already exists
            if (message.conversationId === state.selectedConversationId) {
                const exists = state.messages.some((m) => m.id === message.id);
                if (!exists) {
                    state.messages.push(message);
                }
            }
            // Update conversation's last message
            const conversation = state.conversations.find((c) => c.id === message.conversationId);
            if (conversation) {
                conversation.lastMessage = {
                    id: message.id,
                    content: message.content,
                    senderId: message.senderId,
                    createdAt: message.createdAt,
                };
                conversation.updatedAt = message.createdAt;
                // Move conversation to top
                state.conversations = [
                    conversation,
                    ...state.conversations.filter((c) => c.id !== conversation.id),
                ];
            }
        },

        // Update conversation (from socket.io)
        updateConversation: (state, action: PayloadAction<Conversation>) => {
            const index = state.conversations.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = action.payload;
            } else {
                state.conversations.unshift(action.payload);
            }
        },

        // Mark messages as read
        markAsReadRequest: (state, _action: PayloadAction<string>) => {
            // No loading state needed for this
        },
        markAsReadSuccess: (state, action: PayloadAction<{ conversationId: string; readCount: number }>) => {
            // Update unread count in conversation
            const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
            if (conversation) {
                conversation.unreadCount = Math.max(0, conversation.unreadCount - action.payload.readCount);
            }
        },
        markAsReadFailure: (state, _action: PayloadAction<string>) => {
            // Silent failure, don't show error
        },

        // Clear messages
        clearMessages: (state) => {
            state.messages = [];
            state.selectedConversationId = null;
            state.currentConversation = null;
            state.messagesOffset = 0;
            state.hasMoreMessages = false;
            state.typingUsers = [];
        },

        // Set typing user
        setTypingUser: (state, action: PayloadAction<{ conversationId: string; user: TypingUser }>) => {
            if (action.payload.conversationId === state.selectedConversationId) {
                const exists = state.typingUsers.some((u) => u.userId === action.payload.user.userId);
                if (!exists) {
                    state.typingUsers.push(action.payload.user);
                }
            }
        },

        // Clear typing user
        clearTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
            if (action.payload.conversationId === state.selectedConversationId) {
                state.typingUsers = state.typingUsers.filter((u) => u.userId !== action.payload.userId);
            }
        },

        // Clear all typing users (when conversation changes)
        clearAllTypingUsers: (state) => {
            state.typingUsers = [];
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
} = messageSlice.actions;

export default messageSlice.reducer;

