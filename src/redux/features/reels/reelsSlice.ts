import { createSlice } from '@reduxjs/toolkit';

const reelsSlice = createSlice({
    name: 'reels',
    initialState: {
        list: [], // danh sách reels
        loading: false,
    },
    reducers: {
        setReels(state, action) {
            state.list = action.payload;
        },

        likePostRequest(state, action) {},

        likePostSuccess(state: any, action) {
            const id = action.payload;
            state.list = state.list.map((post: any) =>
                post.id === id
                    ? {
                          ...post,
                          isLiked: !post.isLiked,
                          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                      }
                    : post,
            );
        },
    },
});

export const { setReels, likePostRequest, likePostSuccess } = reelsSlice.actions;
export default reelsSlice.reducer;
