import { MediaFile } from '../types/media.types';
import { Post } from '../types/post.type';
import axios from '../utils/axiosCustomize';

interface GetHomePostsParams {
    page?: number
    limit?: number
}

interface PostsResponse {
    data: {
        posts: Post[]
        currentPage: number
        totalPages: number
        totalPosts: number
        hasMore: boolean
    }
}

export const PostService = {
    /**
     * Upload post với media + metadata
     */
    async uploadPost(
        token: string | null,
        caption: string,
        location: string,
        visibility: string,
        isLikesHidden: boolean,
        isCommentsDisabled: boolean,
        mediaFiles: MediaFile[]
    ) {
        const formData = new FormData();

        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('visibility', visibility);
        formData.append('isLikesHidden', isLikesHidden ? 'true' : 'false');
        formData.append('isCommentsDisabled', isCommentsDisabled ? 'true' : 'false');

        mediaFiles.forEach((media) => {
            formData.append('files', media.file);
        });

        // 🔐 Gửi request
        const res = await axios.post(`post/background`, formData, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data;
    },

    async getById(postId: string) {
        try {
            // axios interceptor đã trả về response.data, nên response đã là data object
            const response = await axios.get(`post/${postId}`);
            return response;
        } catch (error) {
            console.error("Error fetching post detail:", error);
            throw error;
        }
    },

    async getPostsByUserId(userId: number = 5) {
        try {
            const response = await axios.get(`post/user/${userId}`);
            return response;
        } catch (error) {
            console.error("Error fetching post detail:", error);
            throw error;
        }
    },

    async like(postId: string | number) {
        try {
            const res = await axios.post(`post/${postId}/like`);
            return res;
        } catch (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    },

    async save(postId: string | number) {
        try {
            const res = await axios.post(`post/${postId}/save`);
            return res;
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    },

    async comment(postId: string | number, text: string) {
        try {
            const res = await axios.post(`post/${postId}/comments`, { text });
            return res;
        } catch (error) {
            console.error("Error commenting on post:", error);
            throw error;
        }
    },

    update: (id: string, data: any) =>
        axios.patch(`/post/${id}`, data),

    getHomePosts: async (params: GetHomePostsParams = {}): Promise<PostsResponse> => {
        const { page = 1, limit = 10 } = params
        const response = await axios.get("/post/home", {
            params: { page, limit },
        })
        return response
    },
};
