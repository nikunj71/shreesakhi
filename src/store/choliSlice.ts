import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Choli, CholiCategory } from '@/types';
import { getStoredCholis, saveStoredCholis } from '@/lib/storage';

interface CholiState {
  items: Choli[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: CholiCategory | 'All';
  selectedColor: string;
  maxPrice: number;
  statusFilter: string;
  selectedCholiId: string | null;
}

const initialState: CholiState = {
  items: [],
  loading: true,
  error: null,
  searchQuery: '',
  selectedCategory: 'All',
  selectedColor: 'All',
  maxPrice: 20000,
  statusFilter: 'All',
  selectedCholiId: null,
};

// Async thunk to fetch cholis from MongoDB via API
export const fetchCholis = createAsyncThunk(
  'cholis/fetchCholis',
  async (role: string | void, { rejectWithValue }) => {
    try {
      const userRole = role || 'ADMIN';
      const res = await fetch(`/api/cholis?role=${userRole}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch cholis');
      }
      return data.data as Choli[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching cholis');
    }
  }
);

// Async thunk to create a new choli in MongoDB
export const createCholiApi = createAsyncThunk(
  'cholis/createCholiApi',
  async (newCholi: Partial<Choli>, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/cholis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCholi),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save choli');
      }
      return data.data as Choli;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error creating choli');
    }
  }
);

// Async thunk to update an existing choli in MongoDB
export const updateCholiApi = createAsyncThunk(
  'cholis/updateCholiApi',
  async (updatedCholi: Partial<Choli> & { _id?: string; sku?: string }, { rejectWithValue }) => {
    try {
      const targetId = updatedCholi._id || updatedCholi.sku;
      if (!targetId) {
        throw new Error('Choli ID or SKU is missing');
      }
      const res = await fetch(`/api/cholis/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCholi),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update choli');
      }
      return data.data as Choli;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating choli');
    }
  }
);

// Async thunk to delete a choli in MongoDB
export const deleteCholiApi = createAsyncThunk(
  'cholis/deleteCholiApi',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/cholis?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete choli');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error deleting choli');
    }
  }
);

export const choliSlice = createSlice({
  name: 'cholis',
  initialState,
  reducers: {
    setCholis: (state, action: PayloadAction<Choli[]>) => {
      state.items = action.payload;
      saveStoredCholis(state.items);
    },
    addCholi: (state, action: PayloadAction<Choli>) => {
      state.items.unshift(action.payload);
      saveStoredCholis(state.items);
    },
    updateCholi: (state, action: PayloadAction<Choli>) => {
      const index = state.items.findIndex(c => c._id === action.payload._id || c.sku === action.payload.sku);
      if (index !== -1) {
        state.items[index] = action.payload;
        saveStoredCholis(state.items);
      }
    },
    deleteCholi: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(c => c._id !== action.payload && c.sku !== action.payload);
      saveStoredCholis(state.items);
    },
    recordRentalEarnings: (state, action: PayloadAction<{ choliId: string; amount: number }>) => {
      const choli = state.items.find(c => c._id === action.payload.choliId || c.sku === action.payload.choliId);
      if (choli) {
        choli.totalEarnedFromRent = (choli.totalEarnedFromRent || 0) + action.payload.amount;
        choli.isBreakEvenReached = choli.totalEarnedFromRent >= (choli.totalCosting || 0);
        saveStoredCholis(state.items);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<CholiCategory | 'All'>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSelectedCholiId: (state, action: PayloadAction<string | null>) => {
      state.selectedCholiId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCholis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCholis.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        saveStoredCholis(state.items);
      })
      .addCase(fetchCholis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCholiApi.fulfilled, (state, action) => {
        // Prevent duplicate if already added
        const exists = state.items.some(c => c._id === action.payload._id || c.sku === action.payload.sku);
        if (!exists) {
          state.items.unshift(action.payload);
        } else {
          const idx = state.items.findIndex(c => c._id === action.payload._id || c.sku === action.payload.sku);
          if (idx !== -1) state.items[idx] = action.payload;
        }
        saveStoredCholis(state.items);
      })
      .addCase(updateCholiApi.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          c => c._id === action.payload._id || c.sku === action.payload.sku
        );
        if (idx !== -1) {
          state.items[idx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        saveStoredCholis(state.items);
      })
      .addCase(deleteCholiApi.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload && c.sku !== action.payload);
        saveStoredCholis(state.items);
      });
  },
});

export const {
  setCholis,
  addCholi,
  updateCholi,
  deleteCholi,
  recordRentalEarnings,
  setSearchQuery,
  setSelectedCategory,
  setSelectedColor,
  setMaxPrice,
  setStatusFilter,
  setSelectedCholiId
} = choliSlice.actions;

export default choliSlice.reducer;
