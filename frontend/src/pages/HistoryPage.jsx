import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, Trash2, Search, Filter, Download, ShieldAlert, ShieldCheck, Clock, Calendar, Hash, FileText, ChevronRight, Shield, Activity } from 'lucide-react'
import { exportToCSV } from '../utils/helpers'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await api.get('/history')
        setHistory(res.data)
      } catch (err) {
        toast.error('Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
    
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = history.filter((h) => {
    const prediction = h.prediction?.toLowerCase() || ''
    const matchFilter = filter === 'all' || prediction === filter
    const matchSearch = h.id.includes(search) || h.subject.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleDelete = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
    toast.success('Record deleted')
  }

  const handleView = async (item) => {
    try {
      const result = {
        id: item.id,
        prediction: item.prediction,
        confidence: item.confidence,
        timestamp: item.timestamp,
        suspiciousWords: [],
        featureImportance: [
          { feature: 'Confidence Score', importance: item.confidence },
        ],
      }
      sessionStorage.setItem('analysisResult', JSON.stringify(result))
      navigate('/result')
    } catch (err) {
      toast.error('Failed to load result details')
    }
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      {/* Controls Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col lg:flex-row items-center gap-6"
      >
        <div className="relative flex-1 w-full lg:w-auto">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search audit trail by ID or subject..."
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
            <Filter size={18} />
          </div>
          {['all', 'phishing', 'legitimate'].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`
                px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border
                ${filter === f 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'}
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => exportToCSV(filtered, 'phishguard-history.csv')} 
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 cursor-pointer w-full lg:w-auto justify-center"
        >
          <Download size={18} />
          Export Audit
        </button>
      </motion.div>

      {/* Main Table Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden"
      >
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 m-0 tracking-tight uppercase">Audit Logs & Incident History</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Comprehensive forensic trail of analyzed emails</p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <span className="text-blue-700 text-[11px] font-black uppercase tracking-widest">
              {filtered.length} Records Detected
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><div className="flex items-center gap-2"><Hash size={12}/> ID</div></th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><div className="flex items-center gap-2"><FileText size={12}/> Subject Preview</div></th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><div className="flex items-center gap-2"><ShieldCheck size={12}/> Detection Verdict</div></th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><div className="flex items-center gap-2"><Activity size={12}/> Confidence</div></th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"><div className="flex items-center gap-2"><Calendar size={12}/> Timestamp</div></th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filtered.map((row, idx) => (
                  <motion.tr 
                    key={row.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-gray-400 font-mono tracking-tighter uppercase">{row.id}</span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-gray-800 m-0 max-w-[280px] truncate leading-tight group-hover:text-blue-600 transition-colors">
                        {(row.subject || '').replace(/From: .*?\\nSubject: /, '') || 'No Subject Payload'}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      {row.prediction === 'phishing' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-red-600 shadow-sm shadow-red-50">
                          <ShieldAlert size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Phishing</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shadow-sm shadow-emerald-50">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Safe Assets</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${row.confidence * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 + idx * 0.03 }}
                            className={`h-full rounded-full ${row.prediction === 'phishing' ? 'bg-red-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                        <span className="text-xs font-black text-gray-900 italic tracking-tighter">{(row.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600 tracking-tight">
                          {new Date(row.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(row.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleView(row)} 
                          className="p-2.5 bg-white border border-gray-100 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer shadow-sm group-hover:shadow-blue-100"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)} 
                          className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer shadow-sm group-hover:shadow-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 px-10 text-center"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <Search size={40} />
              </div>
              <h4 className="text-lg font-black text-gray-900 m-0 tracking-tight uppercase">No Matching Records</h4>
              <p className="text-sm text-gray-400 font-medium mt-2 max-w-xs">The current filter criteria yielded no results in our forensic audit trail.</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-blue-400"/> Multimodal Email Phishing Detection System Core 4.0</span>
          <span className="flex items-center gap-1.5"><Activity size={12} className="text-emerald-400"/> System Integrity: 99.9%</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:text-blue-600 transition-colors cursor-pointer">Security Protocol</button>
          <button className="hover:text-blue-600 transition-colors cursor-pointer">API Documentation</button>
        </div>
      </div>
    </div>
  )
}
