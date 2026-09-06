import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, PaymentStatus, BookingStatus, DepositRefundStatus } from '@/types';
import { getStoredBookings, saveStoredBookings } from '@/lib/storage';

interface BookingState {
  items: Booking[];
  loading: boolean;
  error: string | null;
  isBookingModalOpen: boolean;
  selectedCholiForBooking: string | null;
  selectedCalendarDate: string | null;
}

const initialState: BookingState = {
  items: [],
  loading: true,
  error: null,
  isBookingModalOpen: false,
  selectedCholiForBooking: null,
  selectedCalendarDate: null,
};

// Async thunk to fetch bookings from MongoDB
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      return data.data as Booking[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching bookings');
    }
  }
);

// Async thunk to save booking to MongoDB
export const createBookingApi = createAsyncThunk(
  'bookings/createBookingApi',
  async (newBooking: Booking, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }
      return data.data as Booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error creating booking');
    }
  }
);

// Async thunk to update booking status in MongoDB
export const updateBookingStatusApi = createAsyncThunk(
  'bookings/updateBookingStatusApi',
  async (
    payload: { id: string; status: BookingStatus; returnDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id,
          status: payload.status,
          actualReturnDate: payload.returnDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update booking status');
      }
      return data.data as Booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating status');
    }
  }
);

// Async thunk to update payment status in MongoDB
export const updateBookingPaymentApi = createAsyncThunk(
  'bookings/updateBookingPaymentApi',
  async (
    payload: { id: string; paymentStatus: PaymentStatus },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id,
          paymentStatus: payload.paymentStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update payment status');
      }
      return data.data as Booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating payment');
    }
  }
);

// Async thunk to update deposit refund in MongoDB
export const updateDepositRefundApi = createAsyncThunk(
  'bookings/updateDepositRefundApi',
  async (
    payload: { id: string; status: DepositRefundStatus },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id,
          depositRefundStatus: payload.status,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update deposit status');
      }
      return data.data as Booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating deposit');
    }
  }
);

export const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.items = action.payload;
      saveStoredBookings(state.items);
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      const exists = state.items.some(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
      if (!exists) {
        state.items.unshift(action.payload);
      }
      saveStoredBookings(state.items);
    },
    updateBookingPayment: (
      state,
      action: PayloadAction<{ id: string; paymentStatus: PaymentStatus }>
    ) => {
      const booking = state.items.find((b) => b._id === action.payload.id || b.bookingNumber === action.payload.id);
      if (booking) {
        booking.paymentStatus = action.payload.paymentStatus;
        saveStoredBookings(state.items);
      }
    },
    updateBookingStatus: (
      state,
      action: PayloadAction<{ id: string; status: BookingStatus; returnDate?: string }>
    ) => {
      const booking = state.items.find((b) => b._id === action.payload.id || b.bookingNumber === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
        if (action.payload.returnDate) {
          booking.actualReturnDate = action.payload.returnDate;
        }
        saveStoredBookings(state.items);
      }
    },
    updateDepositRefund: (
      state,
      action: PayloadAction<{ id: string; status: DepositRefundStatus }>
    ) => {
      const booking = state.items.find((b) => b._id === action.payload.id || b.bookingNumber === action.payload.id);
      if (booking) {
        booking.depositRefundStatus = action.payload.status;
        saveStoredBookings(state.items);
      }
    },
    openBookingModal: (state, action: PayloadAction<string | null>) => {
      state.selectedCholiForBooking = action.payload;
      state.isBookingModalOpen = true;
    },
    closeBookingModal: (state) => {
      state.isBookingModalOpen = false;
      state.selectedCholiForBooking = null;
    },
    setSelectedCalendarDate: (state, action: PayloadAction<string | null>) => {
      state.selectedCalendarDate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        saveStoredBookings(state.items);
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBookingApi.fulfilled, (state, action) => {
        const exists = state.items.some(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
        if (!exists) {
          state.items.unshift(action.payload);
        } else {
          const idx = state.items.findIndex(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
          if (idx !== -1) state.items[idx] = action.payload;
        }
        saveStoredBookings(state.items);
      })
      .addCase(updateBookingStatusApi.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          saveStoredBookings(state.items);
        }
      })
      .addCase(updateBookingPaymentApi.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          saveStoredBookings(state.items);
        }
      })
      .addCase(updateDepositRefundApi.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id || b.bookingNumber === action.payload.bookingNumber);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          saveStoredBookings(state.items);
        }
      });
  },
});

export const {
  setBookings,
  addBooking,
  updateBookingPayment,
  updateBookingStatus,
  updateDepositRefund,
  openBookingModal,
  closeBookingModal,
  setSelectedCalendarDate
} = bookingSlice.actions;

export default bookingSlice.reducer;
