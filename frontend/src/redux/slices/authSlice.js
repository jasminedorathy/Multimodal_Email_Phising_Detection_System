import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// Mock user database for demo fallback (no backend required)
const DEMO_USERS = {
  'admin@email-phishing-detection.system': { id: 'u001', name: 'Alice Chen', email: 'admin@email-phishing-detection.system', role: 'admin' },
  'user@email-phishing-detection.system': { id: 'u002', name: 'John Analyst', email: 'user@email-phishing-detection.system', role: 'analyst' },
}
const DEMO_PASSWORD = 'demo1234'

const mockLogin = (credentials) => {
  const existing = JSON.parse(localStorage.getItem('mockUsers') || '{}')
  const user = DEMO_USERS[credentials.email] || existing[credentials.email]
  if (user && (credentials.password === DEMO_PASSWORD || credentials.password === user.password)) {
    const safeUser = { ...user }
    delete safeUser.password
    return { token: `demo_jwt_${safeUser.id}_${Date.now()}`, user: safeUser }
  }
  return null
}

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  } catch (err) {
    // Fallback to demo auth when backend is unavailable
    const mock = mockLogin(credentials)
    if (mock) {
      localStorage.setItem('token', mock.token)
      localStorage.setItem('user', JSON.stringify(mock.user))
      return mock
    }
    const msg = err?.response?.data?.error || 'Invalid credentials'
    return rejectWithValue(msg)
  }
})

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.register(userData)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (err) {
    // Mock registration — store locally
    const existing = JSON.parse(localStorage.getItem('mockUsers') || '{}')
    const newUser = {
      id: `u_${Date.now()}`, name: userData.name,
      email: userData.email, role: 'analyst', password: userData.password
    }
    existing[userData.email] = newUser
    localStorage.setItem('mockUsers', JSON.stringify(existing))
    // Return null token to redirect to login
    return { token: null, user: null }
  }
})

const storedUser = localStorage.getItem('user')
const storedToken = localStorage.getItem('token')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        // If backend returned a token, log in immediately
        if (action.payload?.token) {
          state.user = action.payload.user
          state.token = action.payload.token
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
