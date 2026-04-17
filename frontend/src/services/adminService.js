import api from './api'

export const adminService = {
  getUsers: async () => {
    const { data } = await api.get('/admin/users')
    return data
  },
  updateUserRole: async (userId, role) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role })
    return data
  },
  deleteUser: async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`)
    return data
  },
  getSystemLogs: async () => {
    const { data } = await api.get('/admin/logs')
    return data
  },
  getModelStats: async () => {
    const { data } = await api.get('/admin/model-stats')
    return data
  },
}
