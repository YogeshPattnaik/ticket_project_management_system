import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@task-management/shared-ui';
import { Workflow } from '@task-management/interfaces';
import {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
} from '../slices/workflowsSlice';

// Fetch Workflows Saga
function* fetchWorkflowsSaga(action: PayloadAction<string>) {
  try {
    const response: { data: { data: Workflow[] } } = yield call(
      apiClient.get,
      `/api/v1/workflows?projectId=${action.payload}`
    );

    yield put(fetchWorkflowsSuccess(response.data.data || []));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to fetch workflows';
    yield put(fetchWorkflowsFailure(errorMessage));
  }
}

export default function* workflowsSaga() {
  yield takeLatest('workflows/fetchWorkflowsStart', fetchWorkflowsSaga);
}

