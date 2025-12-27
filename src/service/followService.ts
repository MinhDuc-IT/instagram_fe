import axios from '../utils/axiosCustomize';

export const FollowService = {
    async followUser(userId: number): Promise<void> {
        try {
            return await axios.post(`/follow/${userId}`);
        } catch (error) {
            console.error('Error following user:', error);
            throw error;
        }
    },

    async getUserProfile(userId: number): Promise<any> {
        try {
            return await axios.get(`follow/profile/${userId}`);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
};
