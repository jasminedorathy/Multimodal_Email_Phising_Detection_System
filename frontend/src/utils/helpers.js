import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (dateStr) => {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy')
  } catch { return dateStr }
}

export const formatDateTime = (dateStr) => {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy HH:mm')
  } catch { return dateStr }
}

export const timeAgo = (dateStr) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch { return dateStr }
}

export const getRiskColor = (score) => {
  if (score >= 0.7) return '#ff003c'
  if (score >= 0.4) return '#ffcc00'
  return '#00ff88'
}

export const getRiskLabel = (score) => {
  if (score >= 0.7) return 'High Risk'
  if (score >= 0.4) return 'Medium Risk'
  return 'Low Risk'
}

export const truncate = (str, len = 50) =>
  str && str.length > len ? str.slice(0, len) + '...' : str

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map((row) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const generateMockDashboardData = () => ({
  totalEmails: 2847,
  phishingDetected: 634,
  safeEmails: 2213,
  accuracy: 97.8,
  weeklyTrend: [
    { day: 'Mon', phishing: 42, safe: 198 },
    { day: 'Tue', phishing: 68, safe: 221 },
    { day: 'Wed', phishing: 31, safe: 187 },
    { day: 'Thu', phishing: 95, safe: 243 },
    { day: 'Fri', phishing: 87, safe: 312 },
    { day: 'Sat', phishing: 23, safe: 89 },
    { day: 'Sun', phishing: 18, safe: 74 },
  ],
  distribution: [
    { name: 'Phishing', value: 634, color: '#ff003c' },
    { name: 'Legitimate', value: 2213, color: '#00ff88' },
  ],
})

export const generateMockResult = (type = 'phishing') => ({
  id: `em_${Date.now()}`,
  prediction: type,
  confidence: type === 'phishing' ? 0.94 : 0.12,
  timestamp: new Date().toISOString(),
  suspiciousWords: ['urgent', 'verify account', 'click here', 'limited time'],
  maliciousUrls: ['http://secure-paypa1.com/verify', 'http://amaz0n-update.net'],
  imageAnomalies: type === 'phishing' ? ['Logo mismatch detected', 'Pixel manipulation near header'] : [],
  featureImportance: [
    { feature: 'Suspicious URL', importance: 0.38 },
    { feature: 'Urgency Keywords', importance: 0.25 },
    { feature: 'Sender Spoofing', importance: 0.18 },
    { feature: 'Image Anomaly', importance: 0.12 },
    { feature: 'Grammar Errors', importance: 0.07 },
  ],
})

export const generateMockHistory = () =>
  Array.from({ length: 20 }, (_, i) => ({
    id: `em_${1000 + i}`,
    subject: `Email Subject ${i + 1}`,
    type: i % 3 === 0 ? 'phishing' : 'legitimate',
    confidence: i % 3 === 0 ? 0.7 + Math.random() * 0.28 : 0.05 + Math.random() * 0.25,
    date: new Date(Date.now() - i * 86400000).toISOString(),
    inputType: ['text', 'file', 'image'][i % 3],
  }))
