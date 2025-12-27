import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import usersReducer from './features/user/userSlice';
import authReducer from './features/auth/authSlice';
import themeReducer from './features/theme/themeSlice';
import messageReducer from './features/message/messageSlice';
import commentReducer from './features/comment/commentSlice';
import postReducer from './features/post/postSlice';
import storyReducer from './features/story/storySlice';

const rootReducer = combineReducers({
    users: usersReducer,
    auth: authReducer,
    theme: themeReducer,
    message: messageReducer,
    comment: commentReducer,
    post: postReducer,
    story: storyReducer,
});

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
    key: 'root',
    storage,
    whitelist: ['auth'], // chỉ lưu auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
            serializableCheck: false,
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
