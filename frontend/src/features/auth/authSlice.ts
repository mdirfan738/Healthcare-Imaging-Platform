import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { AuthUser, LoginRequest, LoginResponse } from '../../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
  accessToken: localStorage.getItem('accessToken'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      return data as LoginResponse;
    } catch (err: unknown) {
      let message = 'Invalid username or password.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const response = (err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }).response;

        message = response?.data?.message ?? message;
      }

      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Best effort; still clear local state.
    }
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          const {
            accessToken,
            refreshToken,
            username,
            fullName,
            role,
          } = action.payload;

          state.status = 'idle';
          state.accessToken = accessToken;
          state.user = {
            username,
            fullName,
            role,
          };

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Login failed.';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;