'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { setCholis, fetchCholis } from '@/store/choliSlice';
import { setBookings, fetchBookings } from '@/store/bookingSlice';
import { setTheme, setUsers, setCurrentUser } from '@/store/authSlice';
import { getStoredCholis, getStoredBookings, getStoredUsers, getStoredCurrentUser } from '@/lib/storage';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { MuiThemeProvider } from './MuiThemeProvider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function Initializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 1. Purge legacy auto-admin session if exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shreesakhi_current_user_v2');
    }

    // 2. Hydrate Cholis, Bookings, and Users from storage/demo
    const cholis = getStoredCholis();
    const bookings = getStoredBookings();
    const users = getStoredUsers();
    const currentUser = getStoredCurrentUser();

    if (cholis.length > 0) dispatch(setCholis(cholis));
    if (bookings.length > 0) dispatch(setBookings(bookings));
    dispatch(setUsers(users));
    dispatch(setCurrentUser(currentUser));

    // Fetch live data directly from MongoDB
    dispatch(fetchCholis(currentUser?.role || 'GUEST'));
    dispatch(fetchBookings());

    // 2. Hydrate Theme: Explicitly default to 'light' and ensure 'dark' class is removed
    const savedTheme = localStorage.getItem('shreesakhi_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      dispatch(setTheme('dark'));
      document.documentElement.classList.add('dark');
    } else {
      dispatch(setTheme('light'));
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shreesakhi_theme', 'light');
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <Provider store={store}>
        <MuiThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Initializer>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </Initializer>
          </LocalizationProvider>
        </MuiThemeProvider>
      </Provider>
    </AppRouterCacheProvider>
  );
}
