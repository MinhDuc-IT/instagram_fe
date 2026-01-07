import axios from '../utils/axiosCustomize';
import { Post } from '../types/post.type';
import { User, UserUpdateRequest } from '../types/user.type';
import { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message?: string;
}

// Users list
export const getUsersApi = async (): Promise<User[]> => {
    const res = await axios.get<ApiResponse<User[]>>('/users');
    return res.data.data;
};

// Posts by user
export const getUserPostsApi = async (userId: number, page = 1, limit = 10): Promise<any> => {
    const res = await axios.get(`/post/user/${userId}`, {
        params: { page, limit },
    });
    return res;
};

// Liked posts
export const getUserLikedPostsApi = async (userId: number): Promise<Post[]> => {
    const res = await axios.get<ApiResponse<Post[]>>(`/users/${userId}/liked-posts`);
    return res.data.data;
};

// Saved posts
export const getUserSavedPostsApi = async (userId: number, page = 1, limit = 10): Promise<any> => {
    const res = await axios.get(`/post/user/${userId}/saved`, {
        params: { page, limit },
    });
    return res;
};

// Reels
export const getUserReelsApi = async (userId: number, page = 1, limit = 10): Promise<any> => {
    const res = await axios.get(`/post/user/${userId}/reels`, {
        params: { page, limit },
    });
    return res;
};

// Get user by ID
export const getUserByIdApi = async (userId: number): Promise<User> => {
    const res = await axios.get<any>(`/users/${userId}`);
    const data = res.data || res;
    console.log('API response for getUserByIdApi:', data);

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
        phone: data.phone,
        gender: data.gender,
        website: data.website,
        isFollowing: data.isFollowing || false,
    } as User;
};

// Update user profile
export const updateProfile = (payload: UserUpdateRequest): Promise<AxiosResponse<User>> => {
    const res = axios.patch('/users/me', payload);
    console.log('API response for updateProfile:', res);
    return res;
};

// Search users
export const searchUsersApi = async (query: string, limit: number = 20): Promise<User[]> => {
    const res = await axios.get('/users/search', {
        params: { q: query, limit },
    });
    // axiosCustomize đã unwrap response.data, nên res đã là data trực tiếp
    return Array.isArray(res) ? res : [];
};
