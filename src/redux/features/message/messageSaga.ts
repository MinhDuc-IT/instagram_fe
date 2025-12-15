import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
    fetchConversationsRequest,
    fetchConversationsSuccess,
    fetchConversationsFailure,
    fetchMessagesRequest,
    fetchMessagesSuccess,
    fetchMessagesFailure,
    sendMessageRequest,
    sendMessageSuccess,
    sendMessageFailure,
    markAsReadRequest,
    markAsReadSuccess,
    markAsReadFailure,
} from './messageSlice';
import {
    getConversationsApi,
    getMessagesApi,
    sendMessageApi,
    markMessagesAsReadApi,
} from '../../../service/messageService';
import { Conversation, Message } from './messageSlice';

// Lấy danh sách cuộc trò chuyện
function* handleFetchConversations() {
    try {
        const res: Conversation[] = yield call(getConversationsApi);
        yield put(fetchConversationsSuccess(res));
    } catch (error: any) {
        yield put(fetchConversationsFailure(error.response?.data?.message || 'Lấy danh sách cuộc trò chuyện thất bại'));
    }
}

// Lấy tin nhắn cho một cuộc trò chuyện
function* handleFetchMessages(action: ReturnType<typeof fetchMessagesRequest>) {
    try {
        const { conversationId, reset } = action.payload;
        const state: any = yield select((state: any) => state.message);
        const currentOffset = reset ? 0 : state.messagesOffset;
        const limit = 20;

        const res: { messages: Message[]; hasMore: boolean; total: number } = yield call(
            getMessagesApi,
            conversationId,
            limit,
            currentOffset,
        );

        const newOffset = reset ? res.messages.length : currentOffset + res.messages.length;

        yield put(
            fetchMessagesSuccess({
                conversationId,
                messages: res.messages,
                hasMore: res.hasMore,
                offset: newOffset,
            }),
        );
    } catch (error: any) {
        yield put(fetchMessagesFailure(error.response?.data?.message || 'Lấy tin nhắn thất bại'));
    }
}

// Gửi tin nhắn
function* handleSendMessage(action: ReturnType<typeof sendMessageRequest>) {
    try {
        const { conversationId, content } = action.payload;
        const res: Message = yield call(sendMessageApi, conversationId, content);
        yield put(sendMessageSuccess(res));
    } catch (error: any) {
        yield put(sendMessageFailure(error.response?.data?.message || 'Gửi tin nhắn thất bại'));
    }
}

// Đánh dấu tin nhắn đã đọc
function* handleMarkAsRead(action: ReturnType<typeof markAsReadRequest>) {
    try {
        const conversationId = action.payload;
        const res: { success: boolean; readCount: number } = yield call(markMessagesAsReadApi, conversationId);
        yield put(markAsReadSuccess({ conversationId, readCount: res.readCount }));
    } catch (error: any) {
        // Lỗi im lặng - không hiển thị lỗi cho người dùng
        yield put(markAsReadFailure(error.response?.data?.message || 'Đánh dấu đã đọc thất bại'));
    }
}

// Root saga
export default function* messageSaga() {
    yield takeEvery(fetchConversationsRequest.type, handleFetchConversations);
    yield takeEvery(fetchMessagesRequest.type, handleFetchMessages);
    yield takeEvery(sendMessageRequest.type, handleSendMessage);
    yield takeEvery(markAsReadRequest.type, handleMarkAsRead);
}
