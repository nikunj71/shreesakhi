import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import choliReducer from './choliSlice';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cholis: choliReducer,
    bookings: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
