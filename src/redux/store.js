// npm i @reduxjs/toolkit react-redux redux-saga

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import catsReducer from './features/cat/catSlice';
import usersReducer from './features/user/userSlice';

const saga = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        cats: catsReducer,
        users: usersReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false }).concat(saga),
});

saga.run(rootSaga);
