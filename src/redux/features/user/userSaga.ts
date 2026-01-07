import { call, put, takeEvery, select } from 'redux-saga/effects';
import { RootState } from '../../store';
import {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchProfileUserRequest,
    fetchProfileUserSuccess,
    fetchProfileUserFailure,
    fetchUserPostsRequest,
    fetchUserPostsSuccess,
    fetchUserPostsFailure,
    fetchSavedPostsRequest,
    fetchSavedPostsSuccess,
    fetchSavedPostsFailure,
    fetchReelsRequest,
    fetchReelsSuccess,
    fetchReelsFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
    searchUsersRequest,
    searchUsersSuccess,
    searchUsersFailure,
} from './userSlice';

import {
    getUsersApi,
    getUserByIdApi,
    getUserPostsApi,
    getUserLikedPostsApi,
    getUserSavedPostsApi,
    getUserReelsApi,
    updateProfile,
    searchUsersApi,
} from '../../../service/userService';

import { User } from '../../../types/user.type';
import { Post } from '../../../types/post.type';
import { UserUpdateRequest } from '../../../types/user.type';
import { setUserAvatar } from '../auth/authSlice';
// Users
function* handleFetchUsers(): Generator<any, void, any> {
    try {
        const res: User[] = yield call(getUsersApi);
        yield put(fetchUsersSuccess(res));
    } catch (error: any) {
        yield put(fetchUsersFailure(error.response?.data?.message || 'Fetch users failed'));
    }
}

// Profile User
function* handleFetchProfileUser(action: ReturnType<typeof fetchProfileUserRequest>): Generator<any, void, any> {
    try {
        const userId = action.payload;

        // Check if already cached
        const state: RootState = yield select();
        if (state.users.profileUserId === userId && state.users.profileUser) {
            console.log('✅ Profile already cached, skipping fetch');
            return;
        }

        const user: User = yield call(getUserByIdApi, userId);
        console.log('Fetched profile user:', user);
        yield put(fetchProfileUserSuccess(user));
    } catch (error: any) {
        console.error('Fetch profile failed:', error);
        yield put(fetchProfileUserFailure(error.response?.data?.message || 'Fetch profile failed'));
    }
}

// updaqte profile
function* handleUpdateProfile(action: ReturnType<typeof updateProfileRequest>): Generator<any, void, any> {
    try {
        const payload: UserUpdateRequest = action.payload;

        const response: any = yield call(updateProfile, payload);
        const updatedUser = response.data || response;
        console.log('Updated profile:', updatedUser);
        yield put(updateProfileSuccess(updatedUser));
        yield put(setUserAvatar(updatedUser.avatar ?? ''));
    } catch (error: any) {
        yield put(updateProfileFailure(error.response?.data?.message || 'Update profile failed'));
    }
}

// Posts
function* handleFetchUserPosts(action: ReturnType<typeof fetchUserPostsRequest>): Generator<any, void, any> {
    try {
        const { userId, page } = action.payload;
        const res = yield call(getUserPostsApi, userId, page);
        yield put(fetchUserPostsSuccess(res));
    } catch (error: any) {
        yield put(fetchUserPostsFailure(error.response?.data?.message || 'Fetch user posts failed'));
    }
}

function* handleFetchSavedPosts(action: ReturnType<typeof fetchSavedPostsRequest>): Generator<any, void, any> {
    try {
        const { userId, page } = action.payload;
        const res = yield call(getUserSavedPostsApi, userId, page);
        yield put(fetchSavedPostsSuccess(res));
    } catch (error: any) {
        yield put(fetchSavedPostsFailure(error.response?.data?.message || 'Fetch saved posts failed'));
    }
}

function* handleFetchReels(action: ReturnType<typeof fetchReelsRequest>): Generator<any, void, any> {
    try {
        const { userId, page } = action.payload;
        const res = yield call(getUserReelsApi, userId, page);
        yield put(fetchReelsSuccess(res));
    } catch (error: any) {
        yield put(fetchReelsFailure(error.response?.data?.message || 'Fetch reels failed'));
    }
}

// Search users
function* handleSearchUsers(action: ReturnType<typeof searchUsersRequest>): Generator<any, void, any> {
    try {
        const { query, limit } = action.payload;
        const res: User[] = yield call(searchUsersApi, query, limit);
        yield put(searchUsersSuccess(res));
    } catch (error: any) {
        yield put(searchUsersFailure(error.response?.data?.message || 'Search users failed'));
    }
}

// Root saga
export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, handleFetchUsers);
    yield takeEvery(fetchProfileUserRequest.type, handleFetchProfileUser);
    yield takeEvery(fetchUserPostsRequest.type, handleFetchUserPosts);
    yield takeEvery(fetchSavedPostsRequest.type, handleFetchSavedPosts);
    yield takeEvery(fetchReelsRequest.type, handleFetchReels);
    yield takeEvery(updateProfileRequest.type, handleUpdateProfile);
    yield takeEvery(searchUsersRequest.type, handleSearchUsers);
}
