import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@shared/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', action.payload.token);
        window.localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    hydrate(state) {
      if (typeof window === 'undefined') return;
      const token = window.localStorage.getItem('token');
      const userRaw = window.localStorage.getItem('user');
      if (token) state.token = token;
      if (userRaw) {
        try {
          state.user = JSON.parse(userRaw) as AuthUser;
        } catch {
          /* ignore */
        }
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
      }
    },
  },
});

export const { setAuth, hydrate, logout } = authSlice.actions;
export default authSlice.reducer;
