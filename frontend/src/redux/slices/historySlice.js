import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { historyService } from '../../services/historyService'

export const fetchHistory = createAsyncThunk('history/fetch', async (params, { rejectWithValue }) => {
  try {
    return await historyService.getHistory(params)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load history')
  }
})

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: { type: 'all', dateFrom: '', dateTo: '' },
    total: 0,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { setFilters } = historySlice.actions
export default historySlice.reducer
