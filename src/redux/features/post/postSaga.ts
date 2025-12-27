
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
} from "./postSlice"
import { RootState } from "../../store"

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
        posts: postsRes.data.posts,
        pagination: {
          currentPage: postsRes.data.currentPage,
          totalPages: postsRes.data.totalPages,
          hasMore: postsRes.data.hasMore,
        },
      })
    )
  } catch (err) {
    yield put(fetchMorePostsFailure())
  }
}

export default function* postSaga() {
  yield takeLatest(fetchHomeFeed.type, fetchHomeFeedSaga)
  yield takeLatest(fetchMorePosts.type, fetchMorePostsSaga)
}