import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../../types/post.type";
export interface User {
    id: number;
    username: string;
    fullName?: string;
    bio?: string;
    avatar?: string;
    followers?: number;
    isFollowing?: boolean;
    [key: string]: any;
}

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
    loading: false,
    error: null,
};

export const userSlice = createSlice({
    name: "users",
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
            state.profileUser = action.payload.user;
            state.profileUserId = action.payload.user.id; // Track để tránh fetch lại
            state.userPosts = action.payload.posts;
            state.loading = false;
        },
        fetchProfileUserFailure: (state, action: PayloadAction<string>) => {
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

        // Follow/unfollow
        toggleFollow: (state, action: PayloadAction<number>) => {
            const userId = action.payload;
            state.users = state.users.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        isFollowing: !user.isFollowing,
                        followers: user.isFollowing
                            ? (user.followers ?? 0) - 1
                            : (user.followers ?? 0) + 1,
                    }
                    : user
            );
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
    toggleFollow,
} = userSlice.actions;

export default userSlice.reducer;
