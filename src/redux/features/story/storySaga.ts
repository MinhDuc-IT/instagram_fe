import { call, put, select, takeLatest } from "redux-saga/effects"
import { storyService } from "../../../service/storyService"
import {
  fetchStories,
  fetchStoriesSuccess,
  fetchStoriesFailure,
  fetchMoreStories,
  fetchMoreStoriesSuccess,
  fetchMoreStoriesFailure,
} from "./storySlice"
import { RootState } from "../../store"
import { SagaIterator } from "redux-saga"

function* fetchStoriesSaga() : SagaIterator {
  try {
    const res = yield call(storyService.getHomeStories, {
      page: 1,
      limit: 10,
    })

    yield put(
      fetchStoriesSuccess({
        stories: res.stories,
        pagination: res.pagination,
      })
    )
  } catch {
    yield put(fetchStoriesFailure())
  }
}

function* fetchMoreStoriesSaga() : SagaIterator {
  try {
    const state: RootState = yield select()
    const nextPage = state.story.currentPage + 1

    const res = yield call(storyService.getHomeStories, {
      page: nextPage,
      limit: 10,
    })

    yield put(
      fetchMoreStoriesSuccess({
        stories: res.stories,
        pagination: res.pagination,
      })
    )
  } catch {
    yield put(fetchMoreStoriesFailure())
  }
}

export function* storySaga() {
  yield takeLatest(fetchStories.type, fetchStoriesSaga)
  yield takeLatest(fetchMoreStories.type, fetchMoreStoriesSaga)
}
