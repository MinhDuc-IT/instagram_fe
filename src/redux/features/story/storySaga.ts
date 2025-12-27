import { call, put, select, takeLatest } from "redux-saga/effects"
import { storyService } from "../../../service/storyService"
import {
    fetchStories,
    fetchStoriesSuccess,
    fetchStoriesFailure,
    fetchMoreStories,
    fetchMoreStoriesSuccess,
    fetchMoreStoriesFailure,
    createStorySuccess,
} from "./storySlice"
import { RootState } from "../../store"
import { SagaIterator } from "redux-saga"
import { PayloadAction } from "@reduxjs/toolkit"

function* fetchStoriesSaga(): SagaIterator {
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

function* fetchMoreStoriesSaga(): SagaIterator {
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

function* createStorySaga(action: PayloadAction<FormData>): SagaIterator {
    const res = yield call(storyService.createStory, action.payload)
    yield put(createStorySuccess(res.data))
}


export function* storySaga() {
    yield takeLatest(fetchStories.type, fetchStoriesSaga)
    yield takeLatest(fetchMoreStories.type, fetchMoreStoriesSaga)
}
