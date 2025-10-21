import {all} from 'redux-saga/effects';
import catSaga from './features/cat/catSaga';
import userSaga from './features/user/userSaga';

export default function* rootSaga() {
    yield all([
        userSaga(),
    ])
}