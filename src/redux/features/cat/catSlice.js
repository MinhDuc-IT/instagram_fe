import { createSlice } from "@reduxjs/toolkit";

export const catSlice = createSlice({
    name: 'cats',
    initialState: {
        cats: [],
        isLoading: false,
        isVisible: true,
    },
    reducers: {
        getCatsFetch: (state) => {
            state.isLoading = true;
        },
        getCatsSuccess: (state, action) => {
            state.cats = action.payload;
            state.isLoading = false;
        },
        getCatsFailure: (state) => {
            state.isLoading = false;
        },
        toggleVisible: (state) => {
            state.isVisible = !state.isVisible;
        }
    }
});

export const {getCatsFetch, getCatsSuccess, getCatsFailure, toggleVisible} = catSlice.actions;

export default catSlice.reducer