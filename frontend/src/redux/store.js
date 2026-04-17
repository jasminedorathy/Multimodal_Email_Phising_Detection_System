import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import analysisReducer from './slices/analysisSlice'
import historyReducer from './slices/historySlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analysis: analysisReducer,
    history: historyReducer,
    ui: uiReducer,
  },
})

export default store
