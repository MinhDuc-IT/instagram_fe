import axios from '../utils/axiosCustomize';
import { AxiosResponse } from 'axios';
import { Conversation, Message } from '../redux/features/message/messageSlice';

// Get all conversations for current user
export const getConversationsApi = (): Promise<AxiosResponse<Conversation[]>> => {
    const res: Promise<AxiosResponse<Conversation[]>> = axios.get<Conversation[]>('/messages/conversations');
    console.log('getConversationsApi called:', res);
    return res;
};

// Get messages for a conversation with pagination
export const getMessagesApi = (
    conversationId: string,
    limit: number = 20,
    offset: number = 0,
): Promise<AxiosResponse<{ messages: Message[]; hasMore: boolean; total: number }>> => {
    return axios.get<{ messages: Message[]; hasMore: boolean; total: number }>(
        `/messages/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    );
};

// Send a message
export const sendMessageApi = (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
): Promise<AxiosResponse<Message>> => {
    return axios.post<Message>(`/messages/conversations/${conversationId}/messages`, {
        content,
        messageType,
        mediaUrl,
    });
};

// Create or get existing conversation with a user
export const getOrCreateConversationApi = (participantId: string): Promise<AxiosResponse<Conversation>> => {
    return axios.post<Conversation>('/messages/conversations', {
        participantId,
    });
};

// Send a message to a user (automatically creates conversation if not exists)
export const sendMessageToUserApi = (
    recipientId: string,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
): Promise<AxiosResponse<Message>> => {
    return axios.post<Message>('/messages/send', {
        recipientId,
        content,
        messageType,
        mediaUrl,
    });
};

// Mark messages as read in a conversation
export const markMessagesAsReadApi = (
    conversationId: string,
): Promise<AxiosResponse<{ success: boolean; readCount: number }>> => {
    return axios.post<{ success: boolean; readCount: number }>(`/messages/conversations/${conversationId}/read`);
};
