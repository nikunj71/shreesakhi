import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/demoData';
import { saveStoredCurrentUser, saveStoredUsers } from '@/lib/storage';

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];
  isAuthModalOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: AuthState = {
  currentUser: null, // Strictly unauthenticated by default (private capital hidden)
  isAuthenticated: false,
  registeredUsers: INITIAL_USERS,
  isAuthModalOpen: false,
  theme: 'light',
};

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
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
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
