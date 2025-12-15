import axios from '../utils/axiosCustomize';

export const ReelService = {
    async getReelsPagination(limit: number = 10, cursor?: string) {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (cursor) {
                params.append('cursor', cursor);
            }

            const response = await axios.get(`/reels/get-reels-pagination?${params.toString()}`);
            return response;
        } catch (error) {
            console.error('Error fetching reels pagination:', error);
            throw error;
        }
    },

    async getReelById(reelId: string) {
        try {
            const response = await axios.get(`/reels/${reelId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reel:', error);
            throw error;
        }
    },
};
