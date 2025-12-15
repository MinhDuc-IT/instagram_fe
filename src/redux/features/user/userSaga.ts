import { call, put, takeEvery, select } from "redux-saga/effects";
import { RootState } from "../../store";
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
    fetchLikedPostsRequest,
    fetchLikedPostsSuccess,
    fetchLikedPostsFailure,
    fetchSavedPostsRequest,
    fetchSavedPostsSuccess,
    fetchSavedPostsFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
} from "./userSlice";

import {
    getUsersApi,
    getUserByIdApi,
    getUserPostsApi,
    getUserLikedPostsApi,
    getUserSavedPostsApi,
    updateProfile,
} from "../../../service/userService";

import { User } from "./userSlice";
import { Post } from "../../../types/post.type";
import {UserUpdateRequest } from "../../../types/user.type";
import { setUserAvatar } from "../auth/authSlice";
// Users
function* handleFetchUsers() {
    try {
        const res: User[] = yield call(getUsersApi);
        yield put(fetchUsersSuccess(res));
    } catch (error: any) {
        yield put(fetchUsersFailure(error.response?.data?.message || "Fetch users failed"));
    }
}

// Profile User (fetch user info + posts)
function* handleFetchProfileUser(action: ReturnType<typeof fetchProfileUserRequest>) {
    try {
        const userId = action.payload;
        
        // Check if already cached
        const state: RootState = yield select();
        if (state.users.profileUserId === userId && state.users.profileUser) {
            console.log("✅ Profile already cached, skipping fetch");
            return;
        }
        
        const user: User = yield call(getUserByIdApi, userId);
        const posts: Post[] = yield call(getUserPostsApi, userId);
        console.log("Fetched profile user:", user);
        console.log("Fetched profile posts:", posts);
        yield put(fetchProfileUserSuccess({ user, posts }));
    } catch (error: any) {
        console.error("Fetch profile failed:", error);
        yield put(fetchProfileUserFailure(error.response?.data?.message || "Fetch profile failed"));
    }
}

// updaqte profile
function* handleUpdateProfile(action: ReturnType<typeof updateProfileRequest>) {
    try {
        const payload: UserUpdateRequest = action.payload;

        const res: User = yield call(updateProfile, payload);
        console.log("Updated profile:", res);
        yield put(updateProfileSuccess(res));
        yield put(setUserAvatar(res.avatar ?? ''));
    } catch (error: any) {
        yield put(
            updateProfileFailure(
                error.response?.data?.message || "Update profile failed"
            )
        );
    }
}

// Posts
function* handleFetchUserPosts(action: ReturnType<typeof fetchUserPostsRequest>) {
  try {
    console.log("🔥 handleFetchUserPosts running, payload:", action.payload);
    const res: Post[] = yield call(getUserPostsApi, action.payload);
    console.log("Fetched user posts:", res);
    yield put(fetchUserPostsSuccess(res));
  } catch (error: any) {
    console.error("Fetch user posts failed:", error);
    yield put(fetchUserPostsFailure(error.response?.data?.message || "Fetch user posts failed"));
  }
}

function* handleFetchLikedPosts(action: ReturnType<typeof fetchLikedPostsRequest>) {
    try {
        const res: Post[] = yield call(getUserLikedPostsApi, action.payload);
        yield put(fetchLikedPostsSuccess(res));
    } catch (error: any) {
        yield put(fetchLikedPostsFailure(error.response?.data?.message || "Fetch liked posts failed"));
    }
}

function* handleFetchSavedPosts(action: ReturnType<typeof fetchSavedPostsRequest>) {
    try {
        const res: Post[] = yield call(getUserSavedPostsApi, action.payload);
        yield put(fetchSavedPostsSuccess(res));
    } catch (error: any) {
        yield put(fetchSavedPostsFailure(error.response?.data?.message || "Fetch saved posts failed"));
    }
}

// Root saga
export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, handleFetchUsers);
    yield takeEvery(fetchProfileUserRequest.type, handleFetchProfileUser);
    yield takeEvery(fetchUserPostsRequest, function* (action) {
        console.log("🔥 Saga received fetchUserPostsRequest:", action);
        yield call(handleFetchUserPosts, action);
    });
    yield takeEvery(fetchLikedPostsRequest.type, handleFetchLikedPosts);
    yield takeEvery(fetchSavedPostsRequest.type, handleFetchSavedPosts);
    yield takeEvery(updateProfileRequest.type, handleUpdateProfile);
}
