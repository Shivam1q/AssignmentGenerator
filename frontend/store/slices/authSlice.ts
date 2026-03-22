import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const getAuthCookie = () => {
    // With httpOnly: true, client-side JS cannot read the token.
    // We rely on fetchCurrentUser to verify session on mount.
    return null;
}

export const setAuthCookie = (_token: string) => {
    // No-op: Server handles cookie setting via Set-Cookie header
}

export const removeAuthCookie = () => {
    // No-op: Server handles cookie clearing via logout endpoint
}

export interface User {
  _id: string;
  name: string;
  schoolName: string;
  city: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null, // Initialized securely without window objects to prevent SSR Hydration failures
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      dispatch(logout());
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAuthCookie(action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeAuthCookie();
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    hydrateToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        state.loading = true; // Signals that we are about to fetch the user
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { loginSuccess, logout, setAuthError, hydrateToken } = authSlice.actions;

export default authSlice.reducer;
