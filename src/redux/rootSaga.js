import {all} from 'redux-saga/effects';
import userSaga from './features/user/userSaga';
import authSaga from './features/auth/authSaga';

export default function* rootSaga() {
    yield all([
        userSaga(),
        authSaga(),
    ])
}