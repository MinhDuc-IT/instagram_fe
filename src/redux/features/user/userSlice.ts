import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '../../../types/post.type';
import { User, UserUpdateRequest } from '../../../types/user.type';
// export interface User {
//     id: number;
//     username: string;
//     fullName?: string;
//     phone?: string;
//     avatar?: string;
//     gender?: string;
//     followers?: number;
//     isFollowing?: boolean;
//     [key: string]: any;
// }

// export interface Post {
//     id: number;
//     userId: number;
//     username: string;
//     userAvatar?: string;
//     image: string;
//     caption?: string;
//     likes: number;
//     comments: any[];
//     timestamp: string;
//     isLiked: boolean;
//     isSaved: boolean;
//     [key: string]: any;
// }

export interface UsersState {
    users: User[];
    profileUser: User | null; // User được xem (khác currentUser)
    profileUserId: number | null; // Track userId để tránh fetch lại
    userPosts: Post[];
    likedPosts: Post[];
    savedPosts: Post[];
    userReels: Post[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    profileUser: null,
    profileUserId: null,
    userPosts: [],
    likedPosts: [],
    savedPosts: [],
    userReels: [],
    loading: false,
    error: null,
};

export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // Users
        fetchUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
            state.loading = false;
        },
        fetchUsersFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Profile User (fetch user info + posts)
        fetchProfileUserRequest: (state, _action: PayloadAction<number>) => {
            state.loading = true;
            state.error = null;
        },
        fetchProfileUserSuccess: (state, action: PayloadAction<{ user: User; posts: Post[] }>) => {
            state.users = state.users.map((u) => (u.id === action.payload.user.id ? action.payload.user : u));
            console.log("action.payload.user", action.payload.user);
            state.profileUser = action.payload.user;
            state.profileUserId = action.payload.user.id; // Track để tránh fetch lại
            state.userPosts = action.payload.posts;
            state.loading = false;
        },
        fetchProfileUserFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // update profile
        updateProfileRequest: (state, _action: PayloadAction<UserUpdateRequest>) => {
            state.loading = true;
            state.error = null;
        },
        updateProfileSuccess: (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.profileUser = action.payload;
            state.users = state.users.map((u) => (u.id === action.payload.id ? { ...u, ...action.payload } : u));
        },
        updateProfileFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Posts
        fetchUserPostsRequest: (state, _action: PayloadAction<number>) => {
            state.loading = true;
            state.error = null;
        },
        fetchUserPostsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.userPosts = action.payload;
            state.loading = false;
        },
        fetchUserPostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        fetchLikedPostsRequest: (state, _action: PayloadAction<number>) => {
            state.loading = true;
            state.error = null;
        },
        fetchLikedPostsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.likedPosts = action.payload;
            state.loading = false;
        },
        fetchLikedPostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        fetchSavedPostsRequest: (state, _action: PayloadAction<number>) => {
            state.loading = true;
            state.error = null;
        },
        fetchSavedPostsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.savedPosts = action.payload;
            state.loading = false;
        },
        fetchSavedPostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        fetchReelsRequest: (state, _action: PayloadAction<number>) => {
            state.loading = true;
            state.error = null;
        },
        fetchReelsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.userReels = action.payload;
            state.loading = false;
        },
        fetchReelsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update a single post in userPosts (used for optimistic updates)
        updatePost: (state, action: PayloadAction<Post>) => {
            const updated = action.payload;
            state.userPosts = state.userPosts.map((p) => (p.id === updated.id ? updated : p));
        },

        // Toggle like on a post (optimistic)
        toggleLikePost: (state, action: PayloadAction<{ postId: string; isLiked: boolean; likes: number }>) => {
            const { postId, isLiked, likes } = action.payload;
            state.userPosts = state.userPosts.map((p) => (p.id === postId ? ({ ...p, isLiked, likes } as Post) : p));
        },

        // Toggle save on a post
        toggleSavePost: (state, action: PayloadAction<{ postId: string; isSaved: boolean }>) => {
            const { postId, isSaved } = action.payload;
            state.userPosts = state.userPosts.map((p) => (p.id === postId ? ({ ...p, isSaved } as Post) : p));
        },

        // Add comment to post (optimistic)
        addCommentToPost: (state, action: PayloadAction<{ postId: string; comment: any }>) => {
            const { postId, comment } = action.payload;
            state.userPosts = state.userPosts.map((p) =>
                p.id === postId ? ({ ...p, comments: [...(p.comments || []), comment] } as Post) : p,
            );
        },

        // Follow/unfollow
        toggleFollow: (state, action: PayloadAction<number>) => {
            const userId = action.payload;

            // Update users array
            state.users = state.users.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        isFollowing: !user.isFollowing,
                        followers: user.isFollowing ? (user.followers ?? 0) - 1 : (user.followers ?? 0) + 1,
                    }
                    : user,
            );

            // Also update profileUser if it matches
            if (state.profileUser && state.profileUser.id === userId) {
                state.profileUser = {
                    ...state.profileUser,
                    isFollowing: !state.profileUser.isFollowing,
                    followers: state.profileUser.isFollowing
                        ? (state.profileUser.followers ?? 0) - 1
                        : (state.profileUser.followers ?? 0) + 1,
                };
            }
        },

        // Append a new comment to a post when received from socket
        addCommentFromSocket: (state, action: PayloadAction<{ postId: string | number; comment: any }>) => {
            const { postId, comment } = action.payload;
            state.userPosts = state.userPosts.map((p) => {
                if (String(p.id) !== String(postId)) return p;

                const existing = (p.comments || []).some((c: any) => c.id === comment.id);
                if (existing) return p;

                const isReply = !!comment?.replyToUser || !!comment?.parentId || !!comment?.rootId;

                if (isReply) {
                    // Nếu là reply, chỉ tăng count của root comment nếu nó có trong list
                    const rootId = comment.rootCommentId || comment.rootId;
                    const updatedComments = (p.comments || []).map((c: any) => {
                        if (c.id === rootId) {
                            return { ...c, repliesCount: (c.repliesCount || 0) + 1 };
                        }
                        return c;
                    });
                    return { ...p, comments: updatedComments } as Post;
                }

                // Nếu là root comment, thêm vào list
                return { ...p, comments: [...(p.comments || []), comment] } as Post;
            });
        },
    },
});

export const {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchProfileUserRequest,
    fetchProfileUserSuccess,
    fetchProfileUserFailure,
    fetchUserPostsRequest,
    fetchUserPostsSuccess,
    fetchUserPostsFailure,
    fetchLikedPostsRequest,
    fetchLikedPostsSuccess,
    fetchLikedPostsFailure,
    fetchSavedPostsRequest,
    fetchSavedPostsSuccess,
    fetchSavedPostsFailure,
    fetchReelsRequest,
    fetchReelsSuccess,
    fetchReelsFailure,
    updatePost,
    toggleLikePost,
    toggleSavePost,
    addCommentToPost,
    toggleFollow,
    addCommentFromSocket,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
} = userSlice.actions;

export default userSlice.reducer;
