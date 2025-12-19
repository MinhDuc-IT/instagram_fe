import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommentState {
    loading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    loading: false,
    error: null,
};

export const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        // Action: Tạo comment
        createCommentRequest: (
            state,
            _action: PayloadAction<{ postId: string; text: string; replyToCommentId?: number; rootCommentId: number }>,
        ) => {
            state.loading = true;
            state.error = null;
        },
        createCommentSuccess: (state, _action: PayloadAction<any>) => {
            state.loading = false;
            state.error = null;
        },
        createCommentFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { createCommentRequest, createCommentSuccess, createCommentFailure } = commentSlice.actions;

export default commentSlice.reducer;
