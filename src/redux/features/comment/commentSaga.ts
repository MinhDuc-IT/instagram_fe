import { call, put, takeEvery } from 'redux-saga/effects';
import { createCommentRequest, createCommentSuccess, createCommentFailure } from './commentSlice';
import { CommentService } from '../../../service/commentService';

// Saga xử lý tạo comment
function* handleCreateComment(action: ReturnType<typeof createCommentRequest>) {
    try {
        const { postId, text, replyToCommentId, rootCommentId } = action.payload;

        // Gọi API để tạo comment
        const comment: any = yield call(CommentService.addComment, postId, text, rootCommentId, replyToCommentId);

        // Dispatch success action
        yield put(createCommentSuccess(comment));

        // Server sẽ tự động emit 'comment_added' broadcast
        // usePostComments hook sẽ nhận và cập nhật UI
    } catch (error: any) {
        yield put(createCommentFailure(error.response?.data?.message || 'Tạo comment thất bại'));
    }
}

// Root saga cho comments
export default function* commentSaga() {
    yield takeEvery(createCommentRequest.type, handleCreateComment);
}
