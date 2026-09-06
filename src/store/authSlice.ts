import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserRole } from '@/types';
import { saveStoredCurrentUser, saveStoredUsers } from '@/lib/storage';

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];
  isAuthModalOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null, // Strictly unauthenticated by default (private capital hidden)
  isAuthenticated: false,
  registeredUsers: [],
  isAuthModalOpen: false,
  theme: 'light',
  loading: false,
  error: null,
};

// Async thunk to fetch all users from MongoDB
export const fetchUsersApi = createAsyncThunk(
  'auth/fetchUsersApi',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      return data.users as UserProfile[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching users');
    }
  }
);

// Async thunk to login user against MongoDB
export const loginUserApi = createAsyncThunk(
  'auth/loginUserApi',
  async (credentials: { email: string; password?: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to login');
      }
      return data.user as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// Async thunk to register staff in MongoDB
export const registerStaffApi = createAsyncThunk(
  'auth/registerStaffApi',
  async (
    staffData: {
      name: string;
      email: string;
      phone?: string;
      employeeCode: string;
      password?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register staff');
      }
      return data.user as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserProfile[]>) => {
      state.registeredUsers = action.payload;
      saveStoredUsers(state.registeredUsers);
    },
    setCurrentUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      saveStoredCurrentUser(state.currentUser);
    },
    loginUser: (state, action: PayloadAction<{ email: string; password?: string }>) => {
      const found = state.registeredUsers.find(
        (u) => u.email.toLowerCase() === action.payload.email.toLowerCase()
      );
      if (found) {
        if (!action.payload.password || !found.password || action.payload.password === found.password) {
          state.currentUser = found;
          state.isAuthenticated = true;
          saveStoredCurrentUser(found);
        }
      }
    },
    registerStaff: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        phone: string;
        employeeCode: string;
        password?: string;
      }>
    ) => {
      const newStaff: UserProfile = {
        id: `usr-staff-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        employeeCode: action.payload.employeeCode,
        role: 'STAFF',
        password: action.payload.password || 'staff123',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      state.registeredUsers.push(newStaff);
      state.currentUser = newStaff;
      state.isAuthenticated = true;
      saveStoredUsers(state.registeredUsers);
      saveStoredCurrentUser(newStaff);
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      saveStoredCurrentUser(null);
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      const matched = state.registeredUsers.find(u => u.role === action.payload);
      if (matched) {
        state.currentUser = matched;
        state.isAuthenticated = true;
        saveStoredCurrentUser(matched);
      } else if (state.currentUser) {
        state.currentUser.role = action.payload;
        saveStoredCurrentUser(state.currentUser);
      }
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('shreesakhi_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('shreesakhi_theme', action.payload);
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsersApi.fulfilled, (state, action) => {
        state.registeredUsers = action.payload;
        saveStoredUsers(state.registeredUsers);
      })
      // Login
      .addCase(loginUserApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserApi.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        saveStoredCurrentUser(action.payload);
      })
      .addCase(loginUserApi.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      // Register
      .addCase(registerStaffApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStaffApi.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.registeredUsers.some(u => u.id === action.payload.id || u.email === action.payload.email);
        if (!exists) {
          state.registeredUsers.push(action.payload);
        }
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        saveStoredUsers(state.registeredUsers);
        saveStoredCurrentUser(action.payload);
      })
      .addCase(registerStaffApi.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Registration failed';
      });
  }
});

export const {
  setUsers,
  setCurrentUser,
  loginUser,
  registerStaff,
  logoutUser,
  setRole,
  openAuthModal,
  closeAuthModal,
  toggleTheme,
  setTheme
} = authSlice.actions;

export default authSlice.reducer;
