import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@task-management/shared-ui';
import { LoginDto, RegisterDto, AuthResponseDto } from '@task-management/dto';
import {
  loginStart,
  registerStart,
  loginSuccess,
  loginFailure,
  logout,
  setToken,
} from '../slices/authSlice';

// Login Saga
function* loginSaga(action: PayloadAction<{ email: string; password: string }>) {
  try {
    yield put(loginStart(action.payload));
    const response: { data: AuthResponseDto } = yield call(
      apiClient.post,
      '/api/v1/auth/login',
      action.payload
    );

    const { accessToken, refreshToken, user } = response.data;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    yield put(
      loginSuccess({
        user,
        accessToken,
        refreshToken,
      })
    );
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Login failed';
    yield put(loginFailure(errorMessage));
  }
}

// Register Saga
function* registerSaga(action: PayloadAction<{ email: string; password: string; organizationName?: string }>) {
  try {
    yield put(registerStart(action.payload));
    const response: { data: AuthResponseDto } = yield call(
      apiClient.post,
      '/api/v1/auth/register',
      action.payload
    );

    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    yield put(
      loginSuccess({
        user,
        accessToken,
        refreshToken,
      })
    );
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || 'Registration failed';
    yield put(loginFailure(errorMessage));
  }
}

// Refresh Token Saga
function* refreshTokenSaga(action: PayloadAction<string>) {
  try {
    const response: { data: { accessToken: string } } = yield call(
      apiClient.post,
      '/api/v1/auth/refresh',
      { refreshToken: action.payload }
    );

    localStorage.setItem('accessToken', response.data.accessToken);
    yield put(setToken(response.data.accessToken));
  } catch (error: any) {
    // Refresh failed, logout user
    yield put(loginFailure('Session expired'));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Logout Saga
function* logoutSaga() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      yield call(apiClient.post, '/api/v1/auth/logout', { refreshToken });
    }
  } catch (error) {
    // Ignore logout errors
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, loginSaga);
  yield takeLatest(registerStart.type, registerSaga);
  yield takeLatest('auth/refreshTokenRequest', refreshTokenSaga);
  yield takeEvery(logout.type, logoutSaga);
}

