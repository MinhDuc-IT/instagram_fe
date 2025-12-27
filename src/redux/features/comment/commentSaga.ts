import { call, put, takeEvery } from 'redux-saga/effects';
import {
    createCommentRequest,
    createCommentSuccess,
    createCommentFailure,
    getCommentsRequest,
    getCommentsFailure,
    getCommentsSuccess,
    getRepliesRequest,
    getRepliesSuccess,
    getRepliesFailure,
    addCommentFromSocket,
} from './commentSlice';
import { CommentService } from '../../../service/commentService';

// Saga xử lý tạo comment
function* handleCreateComment(action: ReturnType<typeof createCommentRequest>): any {
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

function* handleGetComments(action: ReturnType<typeof getCommentsRequest>): any {
    try {
        const { postId, page, cursor } = action.payload;
        const res: any = yield call(() => CommentService.getComments(postId, page, cursor));
        console.log('🚀 ~ file: commentSaga.ts:52 ~ function*handleGetComments ~ comments:', res);
        yield put(getCommentsSuccess(res));
    } catch (error: any) {
        yield put(getCommentsFailure(error.response?.data?.message || 'Lấy comments thất bại'));
    }
}

function* handleGetReplies(action: ReturnType<typeof getRepliesRequest>): any {
    try {
        const { postId, commentId, page, cursor } = action.payload;
        const res: any = yield call(() => CommentService.getReplies(postId, commentId, page, cursor));
        console.log('🚀 ~ file: commentSaga.ts:82 ~ function*handleGetReplies ~ replies:', res);

        // Nếu có cursor (load more), append replies vào danh sách cũ
        if (cursor) {
            // Custom action để append replies
            yield put({
                type: 'comment/appendReplies',
                payload: { commentId, ...res },
            });
        } else {
            // Load lần đầu
            yield put(getRepliesSuccess({ commentId, ...res }));
        }
    } catch (error: any) {
        yield put(getRepliesFailure(error.response?.data?.message || 'Lấy replies thất bại'));
    }
}

// Root saga cho comments
export default function* commentSaga(): any {
    yield takeEvery(createCommentRequest.type, handleCreateComment);
    yield takeEvery(getCommentsRequest.type, handleGetComments);
    yield takeEvery(getRepliesRequest.type, handleGetReplies);
    // Socket sẽ dispatch addCommentFromSocket action trực tiếp
    // reducer sẽ handle việc cập nhật state
}
