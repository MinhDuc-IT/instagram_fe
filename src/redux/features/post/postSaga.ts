
import { call, put, takeLatest, select, all } from "redux-saga/effects"
import { SagaIterator } from "redux-saga"
import { storyService } from "../../../service/storyService"
import { PostService } from "../../../service/postService"
import {
  fetchHomeFeed,
  fetchHomeFeedSuccess,
  fetchHomeFeedFailure,
  fetchMorePosts,
  fetchMorePostsSuccess,
  fetchMorePostsFailure,
  createPostRequest,
  createPostSuccess,
  createPostFailure,
  toggleLikeOptimistic,
} from "./postSlice"
import { RootState } from "../../store"
import { PayloadAction } from "@reduxjs/toolkit"



// Initial fetch saga
function* fetchHomeFeedSaga(): SagaIterator {
  try {
    const [postsRes, storiesRes] = yield all([
      call(PostService.getHomePosts, { page: 1, limit: 10 }),
      //call(storyService.getHomeStories),
    ])

    yield put(
      fetchHomeFeedSuccess({
        posts: postsRes.posts,
        stories: storiesRes,
        pagination: {
          currentPage: postsRes.pagination.currentPage,
          totalPages: postsRes.pagination.totalPages,
          hasMore: postsRes.pagination.hasMore,
        },
      })
    )
  } catch (err) {
    yield put(fetchHomeFeedFailure())
  }
}

// Load more posts saga
function* fetchMorePostsSaga(): SagaIterator {
  try {
    const state: RootState = yield select()
    const nextPage = state.post.currentPage + 1

    const postsRes = yield call(PostService.getHomePosts, {
      page: nextPage,
      limit: 10,
    })

    yield put(
      fetchMorePostsSuccess({
        posts: postsRes.posts,
        pagination: {
          currentPage: postsRes.pagination.currentPage,
          totalPages: postsRes.pagination.totalPages,
          hasMore: postsRes.pagination.hasMore,
        },
      })
    )
  } catch (err) {
    yield put(fetchMorePostsFailure())
  }
}

// Create Post Saga
function* createPostSaga(action: PayloadAction<{ caption: string; image: File; location?: string; visibility: string; isLikesHidden: boolean; isCommentsDisabled: boolean }>): SagaIterator {
  try {
    const { caption, image, location, visibility, isLikesHidden, isCommentsDisabled } = action.payload;
    console.log(action.payload);
    const state: RootState = yield select();
    const token = state.auth.accessToken;

    const mediaFiles = [{ file: image, type: 'image' }];

    const res = yield call(
      PostService.uploadPost,
      token,
      caption,
      location || '',
      'public',
      false,
      false,
      mediaFiles as any
    );

    yield put(createPostSuccess(res.data));

    yield put(fetchHomeFeed());

  } catch (err: any) {
    console.error("Create post failed", err);
    yield put(createPostFailure(err.message || "Failed to create post"));
  }
}

// Toggle like saga
function* toggleLikeSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield call(PostService.like, action.payload)
  } catch (err) {
    console.error("Like API failed", err)
  }
}

export default function* postSaga() {
  yield takeLatest(fetchHomeFeed.type, fetchHomeFeedSaga)
  yield takeLatest(fetchMorePosts.type, fetchMorePostsSaga)
  yield takeLatest(createPostRequest.type, createPostSaga)
  yield takeLatest(toggleLikeOptimistic.type, toggleLikeSaga)
}