import { createSlice } from "@reduxjs/toolkit";
import { catSlice } from "../cat/catSlice";

export const userSlice = createSlice ({
    name: 'users',
    initialState: {},
    reducers: {}
})

export const {} = catSlice.actions;

export default catSlice.reducer;