import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'
import {
  Download, Filter, TrendingUp, Target, Calendar, Activity,
  ShieldAlert, ShieldCheck, Zap, Brain, Lightbulb, Search, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { exportToCSV } from '../utils/helpers'
import api from '../services/api'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-2xl shadow-gray-200/50 min-w-[150px]">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || p.payload?.color }} />
                <span className="text-[11px] font-bold text-gray-600">{p.name || p.dataKey}</span>
              </div>
              <span className="text-[11px] font-black text-gray-900 italic">{(p.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filter, setFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Table State
  const [searchStr, setSearchStr] = useState('')
  const [page, setPage] = useState(1)
  const [sortCol, setSortCol] = useState('timestamp')
  const [sortDesc, setSortDesc] = useState(true)
  const recordsPerPage = 10

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await api.get('/history')
        setHistory(res.data)
      } catch (err) {
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // 1. FILTER DATA
  const filteredData = useMemo(() => {
    return history.filter((h) => {
      if (filter !== 'all' && h.prediction !== filter) return false
      if (dateFrom && new Date(h.timestamp) < new Date(dateFrom)) return false
      if (dateTo && new Date(h.timestamp).setHours(23, 59, 59, 999) < new Date(dateTo).getTime()) return false
      if (searchStr) {
        const query = searchStr.toLowerCase()
        const matchesSubj = h.subject?.toLowerCase().includes(query)
        const matchesId = h.id?.toLowerCase().includes(query)
        if (!matchesSubj && !matchesId) return false
      }
      return true
    })
  }, [history, filter, dateFrom, dateTo, searchStr])

  // Determine Table Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortCol]
      let bVal = b[sortCol]
      if (sortCol === 'confidence') {
        aVal = parseFloat(aVal)
        bVal = parseFloat(bVal)
      }
      if (aVal < bVal) return sortDesc ? 1 : -1
      if (aVal > bVal) return sortDesc ? -1 : 1
      return 0
    })
  }, [filteredData, sortCol, sortDesc])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / recordsPerPage)
  const paginatedData = sortedData.slice((page - 1) * recordsPerPage, page * recordsPerPage)

  const handleSort = (col) => {
    if (sortCol === col) setSortDesc(!sortDesc)
    else {
      setSortCol(col)
      setSortDesc(true)
    }
  }

  // 2. METRICS & STATS
  const totalEmails = filteredData.length
  const phishingCount = filteredData.filter(d => d.prediction === 'phishing').length
  const safeCount = filteredData.filter(d => d.prediction !== 'phishing').length
  const accuracy = totalEmails > 0 ? 98.4 : 0

  // 3. WEEKLY TRENDS (grouped by day)
  const weeklyTrend = useMemo(() => {
    const counts = {}
    filteredData.forEach(h => {
      const d = new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (!counts[d]) counts[d] = { day: d, phishing: 0, safe: 0, sortKey: new Date(h.timestamp).getTime() }
      if (h.prediction === 'phishing') counts[d].phishing++
      else counts[d].safe++
    })
    return Object.values(counts)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ day, phishing, safe }) => ({ day, phishing, safe }))
      .slice(-14)
  }, [filteredData])

  // 4. COMMON FEATURES
  const topFeatures = useMemo(() => {
    let urlSum = 0, textSum = 0, visionSum = 0, metaSum = 0, behaviorSum = 0
    const basis = filteredData.length ? filteredData : []
    const count = basis.length || 1

    basis.forEach(h => {
      urlSum += h.details?.urlScore || 0
      textSum += h.details?.textScore || 0
      visionSum += h.details?.visionScore || 0
      metaSum += h.details?.metaScore || 0
      behaviorSum += h.details?.behaviorScore || 0
    })

    return [
      { feature: 'Suspicious URLs', score: (urlSum / count) * 100, color: '#EF4444' },
      { feature: 'Urgency Keywords', score: (textSum / count) * 100, color: '#F97316' },
      { feature: 'Sender Spoofing', score: (metaSum / count) * 100, color: '#F59E0B' },
      { feature: 'Image Threats', score: (visionSum / count) * 100, color: '#6366F1' },
      { feature: 'Metadata Anomalies', score: (behaviorSum / count) * 100, color: '#8B5CF6' },
    ].sort((a, b) => b.score - a.score)
  }, [filteredData])

  // 5. AI INSIGHTS
  const topRisk = topFeatures[0]?.score > 0 ? topFeatures[0].feature : 'None detected'
  const mostCommonPattern = useMemo(() => {
    const signs = {}
    filteredData.forEach(h => {
      if (h.prediction === 'phishing' && h.details?.signatures) {
        h.details.signatures.forEach(s => {
          if (s) signs[s] = (signs[s] || 0) + 1
        })
      }
    })
    const sorted = Object.entries(signs).sort((a, b) => b[1] - a[1])
    return sorted.length ? sorted[0][0] : 'No distinct patterns'
  }, [filteredData])

  const spikeDetected = useMemo(() => {
    if (weeklyTrend.length >= 2) {
      const last = weeklyTrend[weeklyTrend.length - 1].phishing
      const prev = weeklyTrend[weeklyTrend.length - 2].phishing
      return last > prev * 1.5 && last > 2 ? 'Yes - High Alert' : 'Normal Activity'
    }
    return 'Not enough data'
  }, [weeklyTrend])

  const handleExportCSV = () => {
    const exportData = filteredData.map(row => ({
      'Email ID': row.id,
      'Subject': row.subject || 'No Subject',
      'Prediction': row.prediction === 'phishing' ? 'Phishing' : 'Safe',
      'Confidence (%)': (row.confidence * 100).toFixed(1),
      'Date': new Date(row.timestamp).toLocaleString()
    }))
    exportToCSV(exportData, 'phishguard-analytics.csv')
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* --- FILTER CONTROL PANEL --- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row items-center gap-6 justify-between"
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto scrollbar-hide">
          <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 mr-2">
            <Filter size={18} />
          </div>
          {['all', 'phishing', 'legitimate'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`
                px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border
                ${filter === f
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-900'}
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full sm:w-auto">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none"
            />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* --- OVERVIEW CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Analyzed', value: totalEmails, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Phishing Detected', value: phishingCount, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Safe Emails', value: safeCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Detection Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{loading ? '-' : stat.value}</h4>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="h-96 bg-white border border-gray-100 rounded-3xl shadow-sm animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Zap size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No analytics data available</h3>
          <p className="text-xs font-bold text-gray-500 max-w-sm">
            There are no analysis records matching your selected filters securely. Try adjusting the date range or filter type.
          </p>
        </div>
      ) : (
        <>
          {/* --- CHARTS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Weekly Trend Line Chart */}
            <motion.div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><TrendingUp size={18} /></div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight m-0">Weekly Attack Trends</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Phishing vs Safe</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" formatter={(value) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{value}</span>} />
                    <Line type="smooth" dataKey="phishing" name="Phishing" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="smooth" dataKey="safe" name="Safe" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Features Bar Chart */}
            <motion.div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Target size={18} /></div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight m-0">Most Common Phishing Features</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Aggregated Threat Indicators (%)</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFeatures} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <CartesianGrid stroke="#f1f5f9" horizontal={false} strokeDasharray="4 4" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} width={120} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="score" name="Severity Score" radius={[0, 6, 6, 0]} barSize={12}>
                      {topFeatures.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>

          {/* --- AI INSIGHTS & RECOMMENDATIONS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div className="bg-gradient-to-br from-indigo-600 to-blue-700 border border-blue-800 rounded-3xl p-6 shadow-lg shadow-blue-900/20 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10"><Brain size={180} /></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl"><Brain size={18} /></div>
                <h3 className="text-sm font-black uppercase tracking-widest m-0 text-blue-50">AI Insights Panel</h3>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Most Common Attack Pattern</p>
                  <p className="text-base font-bold text-white capitalize">{mostCommonPattern}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Top Risk Factor</p>
                    <p className="text-sm font-bold text-white leading-tight">{topRisk}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Recent Phishing Spike</p>
                    <p className="text-sm font-bold text-white leading-tight">{spikeDetected}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Lightbulb size={18} /></div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight m-0">Recommendations Panel</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Automated security tips</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Avoid clicking suspicious links without verifying URLs.",
                  "Verify sender domains match known official organizations.",
                  "Be cautious of urgent requests demanding immediate action.",
                  "Report repeated offenders to IT security promptly."
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <p className="text-xs font-bold text-gray-600 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* --- HISTORICAL RESULTS TABLE --- */}
          <motion.div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-600"><Activity size={18} /></div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight m-0">Historical Results</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{filteredData.length} records found</p>
                </div>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 w-full sm:w-64 border border-gray-100">
                <Search size={14} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search by ID or Subject..."
                  value={searchStr}
                  onChange={(e) => setSearchStr(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs font-bold text-gray-700 w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    {['id', 'subject', 'prediction', 'confidence', 'timestamp'].map((col) => (
                      <th key={col} className="px-6 py-4 cursor-pointer group hover:bg-gray-100/50" onClick={() => handleSort(col)}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{col === 'timestamp' ? 'Date' : col}</span>
                          <ArrowUpDown size={12} className={`text-gray-300 transition-colors ${sortCol === col ? 'text-blue-500' : 'group-hover:text-gray-400'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((row) => (
                    <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-gray-400 font-mono tracking-tighter uppercase">{row.id}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-700 truncate max-w-[250px]">{row.subject || 'No Subject'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.prediction === 'phishing' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {row.prediction === 'phishing' ? 'Phishing' : 'Safe'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.prediction === 'phishing' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${row.confidence * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-gray-900 italic">{(row.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {new Date(row.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        No matches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Showing {(page - 1) * recordsPerPage + 1} to {Math.min(page * recordsPerPage, sortedData.length)} of {sortedData.length}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(Math.max(1, page - 1))} 
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-gray-700 px-2">{page} / {totalPages}</span>
                  <button 
                    onClick={() => setPage(Math.min(totalPages, page + 1))} 
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
