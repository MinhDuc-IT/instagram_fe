import { put, takeLatest } from 'redux-saga/effects';
import { likePostRequest, likePostSuccess } from './reelsSlice';

function* likePostSaga(action : ReturnType<typeof likePostRequest>) {
    const postId = action.payload;

    // nếu có backend -> gọi API:
    // yield call(apiLikePost, postId);

    // cập nhật UI ngay (optimistic update)
    yield put(likePostSuccess(postId));
}

export function* reelsSaga() {
    yield takeLatest(likePostRequest.type, likePostSaga);
}
