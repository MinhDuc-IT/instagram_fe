import axios from '../utils/axiosCustomize';

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    User: {
        id: number;
        userName: string;
        avatar?: string;
    };
    likesCount: number;
    repliesCount: number;
}

export interface GetCommentsResponse {
    comments: Comment[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}

export const CommentService = {
    async getComments(postId: string, limit: number = 20, cursor?: string): Promise<GetCommentsResponse> {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (cursor) {
                params.append('cursor', cursor);
            }

            return await axios.get(`/post/${postId}/comments?${params.toString()}`);
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    async addComment(postId: string, content: string, rootCommentId: number, replyToCommentId?: number): Promise<Comment> {
        try {
            const response = await axios.post(`/post/${postId}/comments`, {
                text: content,
                replyToCommentId,
                rootCommentId,
            });
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    async deleteComment(commentId: string): Promise<void> {
        try {
            await axios.delete(`/comments/${commentId}`);
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    async likeComment(postId: string, commentId: string): Promise<void> {
        try {
            await axios.post(`/post/${postId}/comments/${commentId}/like`);
        } catch (error) {
            console.error('Error liking comment:', error);
            throw error;
        }
    },

    async getReplies(
        postId: string,
        commentId: number,
        limit: number = 20,
        cursor?: string,
    ): Promise<GetCommentsResponse> {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (cursor) {
                params.append('cursor', cursor);
            }

            return await axios.get(`/post/${postId}/comments/${commentId}/replies?${params.toString()}`);
        } catch (error) {
            console.error('Error fetching replies:', error);
            throw error;
        }
    },
};
