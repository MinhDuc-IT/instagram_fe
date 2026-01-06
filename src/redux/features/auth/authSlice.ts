import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// User info
export interface User {
    id: string;
    email: string;
    fullName?: string;
    username?: string;
    phone?: string;
    gender?: boolean;
    avatar?: string;
    bio?: string | null;
    website?: string | null;
    posts?: number;
    followers?: number;
    following?: number;
}

// Auth state
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    expiresAt: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    expiresAt: null,
    loading: false,
    error: null,
};

// Payloads
export interface LoginPayload {
    credential: string; // email hoặc username
    password: string;
}

export interface LoginResponse {
    id: string;
    email: string;
    fullName?: string;
    username?: string;
    phone?: string;
    gender?: boolean;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    avatar?: string;
}

export interface UpdateProfilePayload {
    fullName?: string;
    username?: string;
    bio?: string;
    website?: string;
    avatar?: string;
}

// Slice
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Login
        loginRequest: (state, _action: PayloadAction<LoginPayload>) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
            const { id, email, fullName, username, phone, gender, accessToken, refreshToken, expiresAt, avatar } =
                action.payload;
            console.log("loginSuccess payload", action.payload);
            console.log("Setting user in state:", { id, email, fullName, username, avatar, phone, gender });
            state.user = { id, email, fullName, username, avatar, phone, gender };
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.expiresAt = expiresAt;
            state.loading = false;
            state.isAuthenticated = true;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Logout
        logoutRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.expiresAt = null;
            state.isAuthenticated = false;
            state.loading = false;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        logoutFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // // Update profile
        // updateProfileRequest: (state, _action: PayloadAction<UpdateProfilePayload>) => {
        //     state.loading = true;
        //     state.error = null;
        // },
        // updateProfileSuccess: (state, action: PayloadAction<UpdateProfilePayload>) => {
        //     if (state.user) {
        //         state.user = { ...state.user, ...action.payload };
        //     }
        //     state.loading = false;
        // },
        // updateProfileFailure: (state, action: PayloadAction<string>) => {
        //     state.loading = false;
        //     state.error = action.payload;
        // },
        setUserAvatar: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.avatar = action.payload;
            }
        },
        refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string, refreshToken: string }>) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;

            localStorage.setItem("accessToken", action.payload.accessToken);
            localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
    // updateProfileRequest,
    // updateProfileSuccess,
    // updateProfileFailure,
    setUserAvatar,
    refreshTokenSuccess,
} = authSlice.actions;

export default authSlice.reducer;
