import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Basic shape for reels in state
interface ReelState {
    list: any[];
    loading: boolean;
}

const initialState: ReelState = {
    list: [],
    loading: false,
};

const reelsSlice = createSlice({
    name: 'reels',
    initialState,
    reducers: {
        // Replace list with fetched reels
        setReelsFirst(state, action: PayloadAction<any[]>) {
            state.list = action.payload;
        },

        likePostRequest(state, action) {},

        likePostSuccess(state, action: PayloadAction<number>) {
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

        // Append more reels when paginating
        appendReels(state, action: PayloadAction<any[]>) {
            state.list = [...state.list, ...action.payload];
        },

        // Toggle follow state based on current store value
        toggleFollowOnReels(state, action: PayloadAction<number>) {
            const userId = action.payload;
            state.list = state.list.map((reel: any) =>
                reel?.User?.id === userId
                    ? {
                          ...reel,
                          User: {
                              ...reel.User,
                              isFollowing: !reel?.User?.isFollowing,
                          },
                      }
                    : reel,
            );
        },
    },
});

export const { setReelsFirst, likePostRequest, likePostSuccess, appendReels, toggleFollowOnReels } = reelsSlice.actions;
export default reelsSlice.reducer;
