import { MediaFile } from '../types/media.types';
import axios from '../utils/axiosCustomize';

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
            const response = await axios.get(`post/${postId}`);
            return response.data;
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
};
