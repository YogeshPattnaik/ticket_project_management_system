import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@task-management/shared-ui';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@task-management/dto';
import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
} from '../slices/projectsSlice';

// Fetch Projects Saga
function* fetchProjectsSaga() {
  try {
    const response: { data: { data: ProjectDto[] } } = yield call(
      apiClient.get,
      '/api/v1/projects'
    );

    yield put(fetchProjectsSuccess(response.data.data || []));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to fetch projects';
    yield put(fetchProjectsFailure(errorMessage));
  }
}

// Create Project Saga
function* createProjectSaga(action: PayloadAction<CreateProjectDto>) {
  try {
    const response: { data: { data: ProjectDto } } = yield call(
      apiClient.post,
      '/api/v1/projects',
      action.payload
    );

    yield put(createProjectSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to create project';
    yield put(createProjectFailure(errorMessage));
  }
}

// Update Project Saga
function* updateProjectSaga(
  action: PayloadAction<{ id: string; data: UpdateProjectDto }>
) {
  try {
    const response: { data: { data: ProjectDto } } = yield call(
      apiClient.put,
      `/api/v1/projects/${action.payload.id}`,
      action.payload.data
    );

    yield put(updateProjectSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to update project';
    yield put(updateProjectFailure(errorMessage));
  }
}

export default function* projectsSaga() {
  yield takeLatest('projects/fetchProjectsStart', fetchProjectsSaga);
  yield takeEvery('projects/createProjectStart', createProjectSaga);
  yield takeEvery('projects/updateProjectStart', updateProjectSaga);
}

