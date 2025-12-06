import axios from "../utils/axiosCustomize";
import { Post } from "../types/post.type";
import { User, UserUpdateRequest } from "../types/user.type";
import { AxiosResponse } from "axios";

export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message?: string;
}

// Users list
export const getUsersApi = async (): Promise<User[]> => {
    const res = await axios.get<ApiResponse<User[]>>("/users");
    return res.data.data;
};

// Posts by user
export const getUserPostsApi = async (userId: number): Promise<Post[]> => {
    const res = await axios.get<Post[]>(`/post/user/${userId}`);
    // interceptor trả về data trực tiếp
    console.log("API response for user posts:", res);
    return res; // res đã là Post[]
};

// Liked posts
export const getUserLikedPostsApi = async (userId: number): Promise<Post[]> => {
    const res = await axios.get<ApiResponse<Post[]>>(`/users/${userId}/liked-posts`);
    return res.data.data;
};

// Saved posts
export const getUserSavedPostsApi = async (userId: number): Promise<Post[]> => {
    const res = await axios.get<ApiResponse<Post[]>>(`/users/${userId}/saved-posts`);
    return res.data.data;
};

// Get user by ID
export const getUserByIdApi = async (userId: number): Promise<User> => {
    const res = await axios.get<any>(`/users/${userId}`);
    const data = res.data || res;
    console.log("API response for getUserByIdApi:", data);

    // Map backend response to User interface
    return {
        id: data.id,
        username: data.userName || data.username, // Backend trả userName, frontend dùng username
        email: data.email,
        avatar: data.avatar,
        fullName: data.fullName,
        bio: data.bio,
        followers: data.followers || 0,
        following: data.following || 0,
        posts: data.posts || 0,
        isFollowing: data.isFollowing || false,
    } as User;
};

// Update user profile
export const updateProfile = (payload: UserUpdateRequest): Promise<AxiosResponse<User>> => {
    const res = axios.patch("/users/me", payload);
    console.log("API response for updateProfile:", res);
    return res;
}