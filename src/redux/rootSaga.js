import {all} from 'redux-saga/effects';
import userSaga from './features/user/userSaga';
import authSaga from './features/auth/authSaga';
import messageSaga from './features/message/messageSaga';
import commentSaga from './features/comment/commentSaga';
import postSaga from './features/post/postSaga';
import { storySaga } from './features/story/storySaga';

export default function* rootSaga() {
    yield all([
        userSaga(),
        authSaga(),
        messageSaga(),
        commentSaga(),
        postSaga(),
        storySaga(),
    ])
}