import axios from "../utils/axiosCustomize"

export const storyService = {
    getHomeStories: async (params: { page: number; limit: number }) => {
        const res = await axios.get("/stories/home", { params })
        return res
    },

    likeStory: (storyId: string) => axios.post(`/stories/${storyId}/like`),
    viewStory: (storyId: string) => axios.post(`/stories/${storyId}/view`),
    createStory: (data: FormData) => axios.post(`/stories/background`, data),
    sharePost: (postId: string) => axios.post('/stories/share-post', { postId }),
}
