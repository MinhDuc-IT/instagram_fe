import { Post } from "@/src/types/post.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PostState {
  posts: Post[]
  //stories: Story[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  currentPage: number
  totalPages: number
}

const initialState: PostState = {
  posts: [],
  //stories: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  currentPage: 1,
  totalPages: 1,
}

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    // Initial fetch
    fetchHomeFeed(state) {
      state.loading = true
      state.loadingMore = false
      //   state.posts = []
      state.currentPage = 1
      state.hasMore = true
    },

    fetchHomeFeedSuccess(state, action) {
      state.posts = action.payload.posts
      //state.stories = action.payload.stories
      state.currentPage = action.payload.pagination.currentPage
      state.totalPages = action.payload.pagination.totalPages
      state.hasMore = action.payload.pagination.hasMore
      state.loading = false
    },

    fetchHomeFeedFailure(state) {
      state.loading = false
    },

    fetchMorePosts(state) {
      if (state.loadingMore) return
      state.loadingMore = true
    },

    fetchMorePostsSuccess(state, action) {
      const existingIds = new Set(state.posts.map(p => p.id))
      const newPosts = action.payload.posts.filter(
        (p: Post) => !existingIds.has(p.id)
      )

      state.posts.push(...newPosts)
      state.currentPage = action.payload.pagination.currentPage
      state.totalPages = action.payload.pagination.totalPages
      state.hasMore = action.payload.pagination.hasMore
      state.loadingMore = false
    },

    fetchMorePostsFailure(state) {
      state.loadingMore = false
    },
    // Toggle like
    toggleLikeOptimistic(state, action: PayloadAction<string>) {
      const post = state.posts.find(p => p.id === action.payload)
      if (!post) return
      post.isLiked = !post.isLiked
      if (post.likeCount !== undefined && post.likeCount !== null) {
        post.likeCount = post.likeCount + (post.isLiked ? 1 : -1)
      }
    },

    // Toggle save
    toggleSavePost(
      state,
      action: PayloadAction<{ postId: string; isSaved: boolean }>
    ) {
      const post = state.posts.find(p => p.id === action.payload.postId)
      if (post) {
        post.isSaved = action.payload.isSaved
      }
    },

    // Toggle follow - updates all posts by the user
    toggleFollowInPost(state, action: PayloadAction<number>) {
      const userId = action.payload
      state.posts = state.posts.map(post =>
        post.userId === userId
          ? { ...post, isFollowing: !post.isFollowing }
          : post
      )
    },

    // Create Post
    createPostRequest(state, _action: PayloadAction<{ caption: string; image: File; location?: string, visibility: string, isLikesHidden: boolean, isCommentsDisabled: boolean }>) {
      state.loading = true;
    },
    createPostSuccess(state, action: PayloadAction<Post>) {
      state.loading = false;
      state.posts.unshift(action.payload);
    },
    createPostFailure(state, _action: PayloadAction<string>) {
      state.loading = false;
    },
  },
})

export const {
  fetchHomeFeed,
  fetchHomeFeedSuccess,
  fetchHomeFeedFailure,
  fetchMorePosts,
  fetchMorePostsSuccess,
  fetchMorePostsFailure,
  toggleLikeOptimistic,
  toggleSavePost,
  toggleFollowInPost,
  createPostRequest,
  createPostSuccess,
  createPostFailure,
} = postSlice.actions

export default postSlice.reducer
