import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analysisService } from '../../services/analysisService'

export const analyzeEmail = createAsyncThunk('analysis/analyze', async (payload, { rejectWithValue }) => {
  try {
    return await analysisService.analyze(payload)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Analysis failed')
  }
})

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    result: null,
    loading: false,
    error: null,
    inputType: 'text',
  },
  reducers: {
    setInputType: (state, action) => { state.inputType = action.payload },
    clearResult: (state) => { state.result = null; state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeEmail.pending, (state) => { state.loading = true; state.error = null; state.result = null })
      .addCase(analyzeEmail.fulfilled, (state, action) => { state.loading = false; state.result = action.payload })
      .addCase(analyzeEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { setInputType, clearResult } = analysisSlice.actions
export default analysisSlice.reducer
