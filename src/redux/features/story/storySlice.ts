import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { UserStoryGroup } from "@/src/types/story.type";

interface StoryState {
    stories: UserStoryGroup[]
    loading: boolean
    loadingMore: boolean
    currentPage: number
    totalPages: number
    hasMore: boolean,
    loadingCreate?: boolean
}

const initialState: StoryState = {
    stories: [],
    loading: false,
    loadingMore: false,
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
    loadingCreate: false
}

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {
        // Initial fetch
        fetchStories(state) {
            state.loading = true
            state.loadingMore = false
            state.currentPage = 1
            state.hasMore = true
        },

        fetchStoriesSuccess(
            state,
            action: PayloadAction<{
                stories: UserStoryGroup[]
                pagination: {
                    currentPage: number
                    totalPages: number
                    hasMore: boolean
                }
            }>
        ) {
            state.stories = action.payload.stories
            state.currentPage = action.payload.pagination.currentPage
            state.totalPages = action.payload.pagination.totalPages
            state.hasMore = action.payload.pagination.hasMore
            state.loading = false
        },

        fetchStoriesFailure(state) {
            state.loading = false
        },

        // Load more
        fetchMoreStories(state) {
            if (state.loadingMore) return
            state.loadingMore = true
        },

        fetchMoreStoriesSuccess(
            state,
            action: PayloadAction<{
                stories: UserStoryGroup[]
                pagination: {
                    currentPage: number
                    totalPages: number
                    hasMore: boolean
                }
            }>
        ) {
            const existingUserIds = new Set(state.stories.map(s => s.user.id))
            const newStories = action.payload.stories.filter(
                s => !existingUserIds.has(s.user.id)
            )

            state.stories.push(...newStories)
            state.currentPage = action.payload.pagination.currentPage
            state.totalPages = action.payload.pagination.totalPages
            state.hasMore = action.payload.pagination.hasMore
            state.loadingMore = false
        },

        fetchMoreStoriesFailure(state) {
            state.loadingMore = false
        },

        markStoryViewed(state, action: PayloadAction<string>) {
            // Find the group containing the story
            for (const group of state.stories) {
                const story = group.stories.find(s => s.id === action.payload)
                if (story) {
                    story.isViewed = true
                    // Re-evaluate hasUnseen
                    group.hasUnseen = group.stories.some(s => !s.isViewed)
                    break
                }
            }
        },

        createStoryRequest(state, action: PayloadAction<FormData>) {
            state.loadingCreate = true
        },
        createStorySuccess(state, action) {
            state.loadingCreate = false
            // Note: Optimistic update is hard because we need the full user object.
            // Ideally backend returns the full UserStoryGroup or we refetch.
            // For now, let's assume we refetch or the user manually refreshes, 
            // or we add a temporary item if we have the user info.
        },
        createStoryFailure(state) {
            state.loadingCreate = false
        },

        shareStoryRequest(state, action: PayloadAction<string>) {
            state.loadingCreate = true
        },
        shareStorySuccess(state) {
            state.loadingCreate = false
        },
        shareStoryFailure(state) {
            state.loadingCreate = false
        }

    },
})

export const {
    fetchStories,
    fetchStoriesSuccess,
    fetchStoriesFailure,
    fetchMoreStories,
    fetchMoreStoriesSuccess,
    fetchMoreStoriesFailure,
    markStoryViewed,
    createStoryRequest,
    createStorySuccess,
    createStoryFailure,
    shareStoryRequest,
    shareStorySuccess,
    shareStoryFailure
} = storySlice.actions

export default storySlice.reducer
