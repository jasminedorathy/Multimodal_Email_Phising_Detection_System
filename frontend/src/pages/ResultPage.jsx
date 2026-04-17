import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck,
  ArrowLeft, Download, Copy, Fingerprint, 
  Brain, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateMockResult, formatDateTime } from '../utils/helpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-2xl shadow-gray-200/50 min-w-[150px]">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[11px] font-bold text-gray-600">{p.name}</span>
              </div>
              <span className="text-[11px] font-black text-gray-900 italic">{(p.value * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function ResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult')
    if (stored) {
      setResult(JSON.parse(stored))
    } else {
      setResult(generateMockResult('phishing'))
    }
  }, [])

  if (!result) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Retrieving Forensic Data...</p>
    </div>
  )

  const isPhishing = result.prediction === 'phishing'
  const confidencePct = (result.confidence * 100).toFixed(1)

  const handleExportPDF = () => {
    if (!result?.id) {
        toast.error('Missing analysis ID.');
        return;
    }
    toast.success('Downloading Real Report...');
    window.location.href = `http://localhost:5000/api/report/${result.id}`;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 font-sans pb-10">
      {/* Back Link */}
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/analyze')} 
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 text-sm font-bold transition-all w-fit cursor-pointer group"
      >
        <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
          <ArrowLeft size={14} />
        </div>
        Back to Neural Detonation
      </motion.button>

      {/* Main Verdict Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className={`bg-white border-2 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative ${
          isPhishing ? 'border-red-100 shadow-red-100/50' : 'border-emerald-100 shadow-emerald-100/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-xl ${
              isPhishing 
                ? 'bg-red-50 border-2 border-red-100 text-red-600 shadow-red-200/50' 
                : 'bg-emerald-50 border-2 border-emerald-100 text-emerald-600 shadow-emerald-200/50'
            }`}>
              {isPhishing ? <ShieldAlert size={48} /> : <ShieldCheck size={48} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                  isPhishing ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  Neural Classification
                </span>
                <span className="text-gray-300 font-black text-xs font-mono">ID: {result.id}</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter italic uppercase ${
                isPhishing ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {isPhishing ? 'Phishing Detected' : 'Verified Legitimate'}
              </h2>
              <p className="text-sm text-gray-400 font-bold mt-2 flex items-center gap-2 justify-center md:justify-start">
                <Info size={14} className="text-blue-400" />
                Forensic Audit Trail • {formatDateTime(result.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Model Confidence</p>
            <div className="flex items-baseline gap-1">
              <p className={`text-6xl font-black italic tracking-tighter ${
                isPhishing ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {confidencePct}
              </p>
              <span className={`text-2xl font-black italic ${isPhishing ? 'text-red-300' : 'text-emerald-300'}`}>%</span>
            </div>
          </div>
        </div>

        {/* Confidence progress indicator */}
        <div className="mt-10 relative">
          <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
            <motion.div 
              className={`h-full rounded-full ${
                isPhishing ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              onClick={handleExportPDF} 
              className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 cursor-pointer"
            >
              <Download size={18} />
              Export Forensic Report
            </button>
            <button 
              onClick={() => { navigator.clipboard.writeText(result.id); toast.success('Audit ID copied!') }}
              className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              <Copy size={18} />
              Copy Audit ID
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-[0.03] ${
          isPhishing ? 'bg-red-500' : 'bg-emerald-500'
        }`} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analysis Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 m-0 tracking-tight uppercase">Neural Explanations</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">SHAP Feature Contributions</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.featureImportance} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" stroke="#F1F5F9" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 1]} 
                  hide
                />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} 
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" radius={[0, 8, 8, 0]} barSize={20}>
                  {result.featureImportance?.map((_, i) => (
                    <Cell key={i} fill={isPhishing ? `hsl(0, 80%, ${70 - i * 5}%)` : `hsl(150, 80%, ${60 - i * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Indicators List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-8"
        >
          {/* Keywords Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Fingerprint size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 m-0 tracking-tight uppercase">Threat Signatures</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Caught NLP Indicators</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {result.suspiciousWords?.length > 0 ? (
                result.suspiciousWords.map((w, i) => (
                  <span key={i} className="px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-xl tracking-tighter shadow-sm">
                    {w}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic font-medium">No significant keywords identified.</p>
              )}
            </div>
          </div>

          {/* Infrastructure Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <ExternalLink size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 m-0 tracking-tight uppercase">Malicious Infrastructure</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">High-risk URLs & Links</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {result.maliciousUrls?.length > 0 ? (
                result.maliciousUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-200 transition-all group cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
                    <span className="text-[11px] font-mono text-gray-600 truncate">{url}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic font-medium">No malicious links detected.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Anomalies Card */}
      {result.imageAnomalies?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 m-0 tracking-tight uppercase">Visual Anomalies</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Vision-Transformer Discrepancies</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.imageAnomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-3xl group hover:bg-white hover:border-purple-200 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Shield size={18} />
                </div>
                <p className="text-xs text-gray-600 font-bold leading-relaxed m-0 mt-1">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Raw Payload Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-2xl text-gray-900">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 m-0 tracking-tight uppercase">Sanitized Input Payload</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Input evidence processed by AI</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 max-h-[300px] overflow-y-auto scrollbar-hide relative group">
          <p className="text-xs text-gray-500 font-mono leading-loose whitespace-pre-wrap m-0 italic">
            {result.email_body || 'No text payload provided for this audit.'}
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { navigator.clipboard.writeText(result.email_body); toast.success('Payload copied!') }}
              className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all shadow-sm cursor-pointer"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
