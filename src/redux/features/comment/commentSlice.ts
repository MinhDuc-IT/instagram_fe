import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comments } from '@/src/types/comment.types';

export interface CommentState {
    loading: boolean;
    error: string | null;
    comments: any[];
    cursor: string;
    hasMore: boolean;
    repliesComments: Record<string, any>;
}

export interface GetCommentPayload {
    postId: string;
    page: number;
    cursor?: string;
}

export interface getRepliesPayload {
    postId: string;
    commentId: number;
    page: number;
    cursor?: string;
}

const initialState: CommentState = {
    loading: false,
    error: null,
    comments: [],
    cursor: '',
    hasMore: false,
    repliesComments: {},
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

        // Action: Lấy comments
        getCommentsRequest: (state, _action: PayloadAction<GetCommentPayload>) => {
            state.loading = true;
            state.error = null;
        },
        getCommentsSuccess: (
            state,
            action: PayloadAction<{ comments: Comments[]; nextCursor: string; hasMore: boolean }>,
        ) => {
            state.loading = false;
            state.error = null;
            state.comments = [...state.comments, ...action.payload.comments];
            state.repliesComments = { ...state.repliesComments };
            state.cursor = action.payload.nextCursor;
            state.hasMore = action.payload.hasMore;
        },
        getCommentsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetListComment: (state) => {
            state.comments = [];
            state.cursor = '';
            state.hasMore = false;
            state.repliesComments = {};
        },

        // Action: Get replies
        getRepliesRequest: (state, _action: PayloadAction<getRepliesPayload>) => {
            state.loading = true;
            state.error = null;
        },

        getRepliesSuccess: (
            state,
            action: PayloadAction<{
                commentId: number;
                comments: Comments[];
                nextCursor: string;
                hasMore: boolean;
            }>,
        ) => {
            state.loading = false;
            const { commentId, comments, nextCursor, hasMore } = action.payload;
            state.repliesComments[commentId.toString()] = {
                replies: comments,
                cursor: nextCursor,
                hasMore,
                isShowing: true,
                loading: false,
            };
        },

        getRepliesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Action: Thêm comment từ socket
        addCommentFromSocket: (state, action: PayloadAction<any>) => {
            const incoming = action.payload;

            if (state.comments.some((c) => c.id === incoming.id)) {
                console.log('Duplicate comment ID detected, skipping socket update:', incoming.id);
                return;
            }

            const isReply = !!incoming?.replyToUser;
            if (!isReply) {
                // Comment gốc → prepend vào danh sách
                state.comments.unshift(incoming);
            } else {
                // Là reply → tăng repliesCount cho comment gốc nếu đang có trong list
                const rootId = incoming?.rootCommentId ?? incoming?.rootId ?? incoming?.root ?? null;
                if (!rootId) return;

                const rootComment = state.comments.find((c) => c.id === rootId);
                if (rootComment) {
                    rootComment.repliesCount = (rootComment.repliesCount || 0) + 1;
                }

                // Nếu đang mở replies của comment gốc thì append thêm vào repliesState để hiển thị realtime
                const key = rootId.toString();
                const repliesState = state.repliesComments[key];
                if (!repliesState) return; // chưa mở replies → không ép mở

                // Tránh duplicate trong replies
                if (repliesState?.replies?.some((r: any) => r.id === incoming.id)) {
                    console.log('Duplicate reply ID detected in repliesState, skipping:', incoming.id);
                    return;
                }

                // Thêm reply vào danh sách
                repliesState.replies.push(incoming);
            }
        },

        // Action: Toggle replies visibility
        toggleRepliesVisibility: (state, action: PayloadAction<{ commentId: string }>) => {
            const { commentId } = action.payload;
            if (state.repliesComments[commentId]) {
                state.repliesComments[commentId].isShowing = !state.repliesComments[commentId].isShowing;
            }
        },

        // Action: Update replies after like
        updateReplies: (state, action: PayloadAction<{ commentId: string; replies: any[] }>) => {
            const { commentId, replies } = action.payload;
            if (state.repliesComments[commentId]) {
                state.repliesComments[commentId].replies = replies;
            }
        },

        // Action: update like comment
        updateLikeComment: (state, action: PayloadAction<{ comments: any[] }>) => {
            const { comments } = action.payload;
            state.comments = comments;
        },

        // Action: Append replies
        appendReplies: (
            state,
            action: PayloadAction<{ commentId: number; comments: Comments[]; nextCursor: string; hasMore: boolean }>,
        ) => {
            const { commentId, comments, nextCursor, hasMore } = action.payload;
            const commentIdStr = commentId.toString();
            if (state.repliesComments[commentIdStr]) {
                state.repliesComments[commentIdStr].replies = [
                    ...state.repliesComments[commentIdStr].replies,
                    ...comments,
                ];
                state.repliesComments[commentIdStr].cursor = nextCursor;
                state.repliesComments[commentIdStr].hasMore = hasMore;
            }
        },
    },
});

export const {
    createCommentRequest,
    createCommentSuccess,
    createCommentFailure,
    getCommentsRequest,
    getCommentsSuccess,
    getCommentsFailure,
    addCommentFromSocket,
    getRepliesRequest,
    getRepliesSuccess,
    getRepliesFailure,
    toggleRepliesVisibility,
    updateReplies,
    appendReplies,
    updateLikeComment,
    resetListComment,
} = commentSlice.actions;

export default commentSlice.reducer;
