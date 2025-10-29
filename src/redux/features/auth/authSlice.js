import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    expiresAt: null,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            const { id, email, accessToken, refreshToken, expiresAt } = action.payload;
            state.user = { id, email };
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.expiresAt = expiresAt;
            state.loading = false;
            state.isAuthenticated = true;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
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
        },
        logoutFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess, logoutFailure } = authSlice.actions;
export default authSlice.reducer;
