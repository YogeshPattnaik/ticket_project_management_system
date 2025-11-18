import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@task-management/shared-ui';
import { TaskDto, CreateTaskDto, UpdateTaskDto } from '@task-management/dto';
import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  updateTaskStart,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskStart,
  deleteTaskSuccess,
  deleteTaskFailure,
  moveTaskStart,
  moveTaskSuccess,
  moveTaskFailure,
} from '../slices/tasksSlice';

// Fetch Tasks Saga
function* fetchTasksSaga(action: ReturnType<typeof fetchTasksStart>) {
  try {
    const params = new URLSearchParams();
    if (action.payload.projectId) {
      params.append('projectId', action.payload.projectId);
    }
    if (action.payload.status) {
      params.append('status', action.payload.status);
    }

    const response: { data: { data: TaskDto[] } } = yield call(
      apiClient.get,
      `/api/v1/tasks?${params.toString()}`
    );

    yield put(fetchTasksSuccess(response.data.data || []));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to fetch tasks';
    yield put(fetchTasksFailure(errorMessage));
  }
}

// Create Task Saga
function* createTaskSaga(action: PayloadAction<CreateTaskDto>) {
  try {
    const response: { data: { data: TaskDto } } = yield call(
      apiClient.post,
      '/api/v1/tasks',
      action.payload
    );

    yield put(createTaskSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to create task';
    yield put(createTaskFailure(errorMessage));
  }
}

// Update Task Saga
function* updateTaskSaga(
  action: PayloadAction<{ id: string; data: UpdateTaskDto }>
) {
  try {
    const response: { data: { data: TaskDto } } = yield call(
      apiClient.put,
      `/api/v1/tasks/${action.payload.id}`,
      action.payload.data
    );

    yield put(updateTaskSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to update task';
    yield put(updateTaskFailure(errorMessage));
  }
}

// Delete Task Saga
function* deleteTaskSaga(action: PayloadAction<string>) {
  try {
    yield call(apiClient.delete, `/api/v1/tasks/${action.payload}`);
    yield put(deleteTaskSuccess(action.payload));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to delete task';
    yield put(deleteTaskFailure(errorMessage));
  }
}

// Move Task Saga (for Kanban)
function* moveTaskSaga(
  action: PayloadAction<{ taskId: string; newStatus: string }>
) {
  try {
    const response: { data: { data: TaskDto } } = yield call(
      apiClient.post,
      `/api/v1/tasks/${action.payload.taskId}/move`,
      { status: action.payload.newStatus }
    );

    yield put(moveTaskSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to move task';
    yield put(
      moveTaskFailure({
        taskId: action.payload.taskId,
        error: errorMessage,
      })
    );
  }
}

export default function* tasksSaga() {
  yield takeLatest('tasks/fetchTasksStart', fetchTasksSaga);
  yield takeEvery('tasks/createTaskStart', createTaskSaga);
  yield takeEvery('tasks/updateTaskStart', updateTaskSaga);
  yield takeEvery('tasks/deleteTaskStart', deleteTaskSaga);
  yield takeEvery('tasks/moveTaskStart', moveTaskSaga);
}

