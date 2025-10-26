import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import usersReducer from './features/user/userSlice';
import authReducer from './features/auth/authSlice';
import themeReducer from './features/theme/themeSlice';

const rootReducer = combineReducers({
    users: usersReducer,
    auth: authReducer,
    theme: themeReducer,
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const saga = createSagaMiddleware();

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
            serializableCheck: false,
        }).concat(saga),
});

saga.run(rootSaga);
export const persistor = persistStore(store);