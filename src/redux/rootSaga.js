import {all} from 'redux-saga/effects';
import userSaga from './features/user/userSaga';
import authSaga from './features/auth/authSaga';
import messageSaga from './features/message/messageSaga';
import commentSaga from './features/comment/commentSaga';

export default function* rootSaga() {
    yield all([
        userSaga(),
        authSaga(),
        messageSaga(),
        commentSaga(),
    ])
}