import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDto } from '@task-management/dto';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    registerStart: (state, action: PayloadAction<{ email: string; password: string; organizationName?: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: UserDto;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const {
  loginStart,
  registerStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setToken,
} = authSlice.actions;

export default authSlice.reducer;

