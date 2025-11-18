import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@task-management/shared-ui';
import { KanbanBoard, Column } from '@task-management/interfaces';
import {
  fetchBoardStart,
  fetchBoardSuccess,
  fetchBoardFailure,
  updateColumnStart,
  updateColumnSuccess,
} from '../slices/boardsSlice';

// Fetch Board Saga
function* fetchBoardSaga(action: PayloadAction<string>) {
  try {
    const response: { data: { data: KanbanBoard } } = yield call(
      apiClient.get,
      `/api/v1/boards/${action.payload}`
    );

    yield put(fetchBoardSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to fetch board';
    yield put(fetchBoardFailure(errorMessage));
  }
}

// Update Column Saga
function* updateColumnSaga(
  action: PayloadAction<{ boardId: string; columnId: string; updates: Partial<Column> }>
) {
  try {
    const response: { data: { data: Column } } = yield call(
      apiClient.put,
      `/api/v1/boards/${action.payload.boardId}/columns/${action.payload.columnId}`,
      action.payload.updates
    );

    yield put(
      updateColumnSuccess({
        boardId: action.payload.boardId,
        column: response.data.data,
      })
    );
  } catch (error: any) {
    // Handle error (could dispatch failure action)
    console.error('Failed to update column:', error);
  }
}

export default function* boardsSaga() {
  yield takeLatest('boards/fetchBoardStart', fetchBoardSaga);
  yield takeEvery('boards/updateColumnStart', updateColumnSaga);
}

