import { call, put, takeLatest } from "redux-saga/effects";
import { loginSuccess, loginFailure, logoutSuccess, logoutFailure } from "./authSlice";
import { loginUser, logoutUser } from "../../../service/authService";

function* handleLogin(action) {
    try {
        const res = yield call(loginUser, action.payload);
        console.log("Login response:", res);

        if (res.statusCode === 200) {
            yield put(loginSuccess(res.data));
        } else {
            yield put(loginFailure(res.message));
        }
    } catch (error) {
        console.log("Login error:", error.response?.data || error.message);
        yield put(loginFailure(error.response?.data?.message || "Đăng nhập thất bại"));
    }
}

function* handleLogout() {
    try {
        yield call(logoutUser);
        yield put(logoutSuccess());
    } catch (error) {
        console.log("Logout error:", error.response?.data || error.message);
        yield put(logoutFailure(error.response?.data?.message || "Đăng xuất thất bại"));
    }
}

export default function* authSaga() {
    yield takeLatest("auth/loginRequest", handleLogin);
    yield takeLatest("auth/logoutRequest", handleLogout);
}
