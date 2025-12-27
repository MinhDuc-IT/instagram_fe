import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Story } from "@/src/types/story.type";

interface StoryState {
  stories: Story[]
  loading: boolean
  loadingMore: boolean
  currentPage: number
  totalPages: number
  hasMore: boolean
}

const initialState: StoryState = {
  stories: [],
  loading: false,
  loadingMore: false,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
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
        stories: Story[]
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
        stories: Story[]
        pagination: {
          currentPage: number
          totalPages: number
          hasMore: boolean
        }
      }>
    ) {
      const existingIds = new Set(state.stories.map(s => s.id))
      const newStories = action.payload.stories.filter(
        s => !existingIds.has(s.id)
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
      const story = state.stories.find(s => s.id === action.payload)
      if (story) story.isViewed = true
    },
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
} = storySlice.actions

export default storySlice.reducer
