import api from './api'

export const historyService = {
  getHistory: async (params = {}) => {
    const { data } = await api.get('/history', { params })
    return data
  },
  getDetail: async (id) => {
    const { data } = await api.get(`/history/${id}`)
    return data
  },
  deleteRecord: async (id) => {
    const { data } = await api.delete(`/history/${id}`)
    return data
  },
}
