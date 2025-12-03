import { call, put, takeLatest } from "redux-saga/effects";
import {
    loginRequest,
    loginSuccess,
    loginFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
    LoginPayload,
} from "./authSlice";
import { loginUser, LoginUserDTO, logoutUser } from "../../../service/authService";
import { AxiosError, AxiosResponse } from "axios";

// Login saga
function* handleLogin(action: ReturnType<typeof loginRequest>) {
    try {
        const payload: LoginUserDTO = action.payload;
        const res: { statusCode: number; data: any; message?: string } = yield call(loginUser, payload);
        if (res.statusCode === 200) {
            yield put(loginSuccess(res.data));
        } else {
            yield put(loginFailure(res.data?.message || "Đăng nhập thất bại"));
        }
    } catch (error: unknown) {
        let message = "Đăng nhập thất bại";
        if ((error as AxiosError).isAxiosError) {
            message = (error as AxiosError<{ message: string }>).response?.data?.message || message;
        }
        yield put(loginFailure(message));
    }
}

// Logout saga
function* handleLogout() {
    try {
        yield call(logoutUser);
        yield put(logoutSuccess());
    } catch (error: unknown) {
        let message = "Đăng xuất thất bại";
        if ((error as AxiosError).isAxiosError) {
            message = (error as AxiosError<{ message: string }>).response?.data?.message || message;
        }
        yield put(logoutFailure(message));
    }
}

// Watcher saga
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(logoutRequest.type, handleLogout);
}
