import api from './api'

export const analysisService = {
  analyze: async (payload) => {
    const formData = new FormData()
    if (payload.text) formData.append('text', payload.text)
    if (payload.urls && payload.urls.length) formData.append('urls', JSON.stringify(payload.urls))
    if (payload.image) formData.append('image', payload.image)
    if (payload.file) formData.append('file', payload.file)
    if (payload.metadata) formData.append('metadata', JSON.stringify(payload.metadata))
    if (payload.persuasion && payload.persuasion.length) formData.append('persuasion', JSON.stringify(payload.persuasion))

    const { data } = await api.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  getStats: async () => {
    const { data } = await api.get('/stats')
    return data
  },
  getInsights: async () => {
    const { data } = await api.get('/insights')
    return data
  }
}
