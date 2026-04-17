import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, ShieldAlert, ShieldCheck, Activity, Target, Network, 
  AlertTriangle, Shield, CheckCircle2, ChevronRight, Lock, Key, Eye, Clock, TrendingUp, Mail
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../services/api'
import { timeAgo } from '../utils/helpers'

const FlowNode = ({ icon: Icon, title, desc, active, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`flex items-start gap-4 p-4 rounded-2xl border ${active ? 'bg-white border-blue-100 shadow-xl shadow-blue-100/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}
  >
    <div className={`p-2 rounded-xl ${active ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
      <Icon size={18} />
    </div>
    <div>
      <h4 className={`text-xs font-black uppercase tracking-widest ${active ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
      <p className="text-[10px] font-bold text-gray-400 mt-1 leading-tight">{desc}</p>
    </div>
  </motion.div>
)

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{data.category}</p>
        <p className="text-sm font-black text-gray-900 mb-2">{data.score}% Risk</p>
        <p className="text-[10px] font-bold text-gray-500 max-w-[150px] leading-tight">{data.insight}</p>
      </div>
    )
  }
  return null
}

export default function AIInsightsPage() {
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/history')
        setHistoryData(res.data)
      } catch (err) {
        console.error('Failed to load insights')
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
    const int = setInterval(fetchInsights, 15000)
    return () => clearInterval(int)
  }, [])

  const { targetAlert, aggregated, trends } = useMemo(() => {
    const phish = historyData.filter(d => d.prediction === 'phishing')
    const safe = historyData.filter(d => d.prediction !== 'phishing')
    const target = phish.length > 0 ? phish[0] : null // The most recent attack

    // Trend intel (last 7 days vs previous 7 days)
    const now = new Date()
    const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const d14 = new Date(now - 14 * 24 * 60 * 60 * 1000)
    
    let currWeekPhish = 0; let prevWeekPhish = 0;
    phish.forEach(p => {
      const d = new Date(p.timestamp)
      if (d >= d7) currWeekPhish++
      else if (d >= d14) prevWeekPhish++
    })
    
    const pctChange = prevWeekPhish > 0 ? Math.round(((currWeekPhish - prevWeekPhish) / prevWeekPhish) * 100) : (currWeekPhish > 0 ? 100 : 0)

    // Aggegated averages
    const aggs = { text: 0, url: 0, meta: 0, vis: 0, beh: 0 }
    if (phish.length > 0) {
      phish.forEach(p => {
        aggs.text += p.details?.textScore || 0
        aggs.url += p.details?.urlScore || 0
        aggs.meta += p.details?.metaScore || 0
        aggs.vis += p.details?.visionScore || 0
        aggs.beh += p.details?.behaviorScore || 0
      })
      Object.keys(aggs).forEach(k => aggs[k] = Math.round(aggs[k] / phish.length))
    }

    return { targetAlert: target, aggregated: aggs, trends: { pctChange, currWeekPhish } }
  }, [historyData])


  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Assembling Threat Intelligence...</p>
    </div>
  )

  if (!targetAlert && historyData.length === 0) return (
    <div className="max-w-7xl mx-auto text-center py-20 bg-white rounded-3xl border border-gray-100">
      <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
      <h2 className="text-xl font-black uppercase text-gray-900">Zero Threats Detected</h2>
      <p className="text-sm font-bold text-gray-500 mt-2">The system requires active payloads to generate explainable intelligence.</p>
    </div>
  )

  // Radar Data Build (Uses aggregated averages or the target alert)
  const radarData = [
    { category: 'Text Intent', score: targetAlert?.details?.textScore || aggregated.text, insight: 'Analyzes embedded semantic pressure and explicit keywords.' },
    { category: 'URL Payloads', score: targetAlert?.details?.urlScore || aggregated.url, insight: 'Checks for typosquatting, hidden IPs, and malicious TLDs.' },
    { category: 'Metadata', score: targetAlert?.details?.metaScore || aggregated.meta, insight: 'Verifies sender mismatches and SPF/DKIM spoofing.' },
    { category: 'Psychology', score: targetAlert?.details?.behaviorScore || aggregated.beh, insight: 'Deep learning evaluation of emotional manipulation.' },
    { category: 'Vision OCR', score: targetAlert?.details?.visionScore || aggregated.vis, insight: 'Extracts embedded text from attached images.' },
  ]

  // Taxonomy Build
  const taxonomies = [
    { id: 'urgency', label: 'Urgency Manipulation', icon: Clock, risk: 'Critical', active: aggregated.text > 40 || aggregated.beh > 40 },
    { id: 'cred', label: 'Credential Harvesting', icon: Key, risk: 'High', active: aggregated.url > 50 || (targetAlert?.suspicious_words?.includes('login')) },
    { id: 'brand', label: 'Brand Impersonation', icon: Target, risk: 'High', active: aggregated.meta > 50 },
    { id: 'obfus', label: 'Image Obfuscation', icon: Eye, risk: 'Medium', active: aggregated.vis > 30 },
  ]

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl shadow-gray-900/20">
             <Brain size={28} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-gray-900 m-0 tracking-tighter uppercase">Neural Intelligence</h2>
             <p className="text-xs text-gray-500 font-bold m-0 mt-1 tracking-widest uppercase">Explainable AI & Forensics</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full border border-emerald-100 bg-emerald-50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live Tracking Enabled</span>
          </div>
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${targetAlert ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            <AlertTriangle size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Severity: {targetAlert ? 'CRITICAL' : 'LOW'}</span>
          </div>
        </div>
      </div>

      {/* ROW 1: AI EXPLAINER & STORYLINE */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6">
        
        {/* AI Decision Explainer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cyber-card relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><ShieldAlert size={20} /></div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">AI Decision Breakdown</h3>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Profile Analysis</p>
            {targetAlert ? (
              <p className="text-sm font-bold text-gray-800 leading-relaxed">
                The latest payload was instantly classified as <span className="text-red-600 font-black italic">PHISHING</span> at <span className="font-black">{(targetAlert.confidence * 100).toFixed(1)}%</span> confidence due to colliding heuristic and neural indicators.
              </p>
            ) : (
              <p className="text-sm font-bold text-emerald-600 leading-relaxed">System remains fully secure. No critical attacks identified in recent memory limits.</p>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Explicit Triggers</h4>
            <ul className="space-y-3">
              {(targetAlert?.details?.urlScore > 40) && <li className="flex items-start gap-2.5 text-xs font-bold text-gray-700"><span className="mt-0.5 text-red-500"><AlertTriangle size={14}/></span> Suspicious or obscured domain sequence detected.</li>}
              {(targetAlert?.details?.textScore > 40) && <li className="flex items-start gap-2.5 text-xs font-bold text-gray-700"><span className="mt-0.5 text-orange-500"><AlertTriangle size={14}/></span> Syntactic urgency and pressure statements identified.</li>}
              {(targetAlert?.details?.metaScore > 40) && <li className="flex items-start gap-2.5 text-xs font-bold text-gray-700"><span className="mt-0.5 text-amber-500"><AlertTriangle size={14}/></span> Sender domain severely mismatches implicit brand identity.</li>}
              {(targetAlert?.details?.behaviorScore > 40) && <li className="flex items-start gap-2.5 text-xs font-bold text-gray-700"><span className="mt-0.5 text-purple-500"><AlertTriangle size={14}/></span> Behavioral manipulation signals via fear/urgency gating.</li>}
              {!targetAlert && <li className="text-xs font-bold text-gray-400">Resting baseline normal.</li>}
            </ul>
          </div>
        </motion.div>

        {/* Attack Storyline (Unique Feature) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="cyber-card bg-gray-900 border-none shadow-2xl relative overflow-hidden !p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-blue-500"><Network size={200} /></div>
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 bg-white/10 rounded-lg text-blue-400 backdrop-blur-md"><Activity size={20} /></div>
            <div>
              <h3 className="text-sm font-black text-white tracking-widest uppercase m-0">Predicted Attack Storyline</h3>
              <p className="text-[9px] text-blue-400 uppercase tracking-[0.2em] mt-1 font-bold">Neural Chain Extrapolation</p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FlowNode icon={Mail} title="Phase 1: Ingestion" desc="Payload circumvents basic perimeter defenses via spoofed headers." active={true} delay={0.2} />
            <FlowNode icon={Brain} title="Phase 2: Trigger Activation" desc="Victim is mentally compromised via high-urgency semantic gating." active={targetAlert?.details?.textScore > 30} delay={0.3} />
            <FlowNode icon={Target} title="Phase 3: Deep Link Routing" desc="Victim clicks credential harvesting domain disguised as safe portal." active={targetAlert?.details?.urlScore > 30} delay={0.4} />
            <FlowNode icon={Lock} title="Phase 4: Exfiltration" desc="Credentials silently captured. Multimodal Email Phishing Detection System intercepts and isolates." active={targetAlert != null} delay={0.5} />
          </div>
        </motion.div>
      </div>

      {/* ROW 2: RADAR & PSYCHOLOGY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Detection Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="cyber-card flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Target size={20} /></div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Platform Vector Radar</h3>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} />
                <Radar name="Threat Matrix" dataKey="score" stroke="#4F46E5" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Interactive: Hover nodes for structural meaning</p>
        </motion.div>

        {/* Psychological Analysis Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="cyber-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Brain size={20} /></div>
            <div>
               <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase m-0">Psychological Intent</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Semantic Translation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">High Urgency ({targetAlert?.details?.textScore || aggregated.text}%)</span>
                <span className="text-xs font-bold text-red-500">Pressure Tactic</span>
              </div>
              <p className="text-xs font-bold text-gray-500 leading-tight">The user is being actively pressured to bypass normal reasoning and act immediately.</p>
            </div>

            <div className="relative group p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Authority Spoofing ({targetAlert?.details?.metaScore || aggregated.meta}%)</span>
                <span className="text-xs font-bold text-blue-500">Impersonation</span>
              </div>
              <p className="text-xs font-bold text-gray-500 leading-tight">The email heavily exploits the visual and meta identity of a trusted institutional entity.</p>
            </div>

            <div className="relative group p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition-colors">
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Moderate Fear ({targetAlert?.details?.behaviorScore || aggregated.beh}%)</span>
                <span className="text-xs font-bold text-orange-500">Threat-based</span>
              </div>
              <p className="text-xs font-bold text-gray-500 leading-tight">Threat-based consequences are interwoven to bypass secondary validation checks.</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ROW 3: TRENDS, TAXONOMIES, RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trend Intelligence */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="cyber-card col-span-1">
          <h3 className="text-[11px] font-black text-gray-900 tracking-widest uppercase mb-6 flex items-center gap-2"><TrendingUp size={14}/> Temporal Trends</h3>
          <ul className="space-y-4">
            <li className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mb-1">Weekly Delta</span>
              <span className="text-xs font-bold text-gray-800">Platform phishing volume shifted by <span className="font-black text-blue-700">{trends.pctChange}%</span> this week.</span>
            </li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Most Targeted</span>
              <span className="text-xs font-bold text-gray-800">Financial & Verification systems</span>
            </li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Primary Tactic</span>
              <span className="text-xs font-bold text-gray-800">Account Suspension Scams</span>
            </li>
          </ul>
        </motion.div>

        {/* Dynamic Taxonomies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="cyber-card col-span-1">
          <h3 className="text-[11px] font-black text-gray-900 tracking-widest uppercase mb-6 flex items-center gap-2"><Lock size={14}/> Active Taxonomies</h3>
          <div className="space-y-3">
            {taxonomies.map(t => (
              <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${t.active ? 'bg-white border-red-200 shadow-sm' : 'bg-gray-50 border-transparent opacity-50 grayscale'}`}>
                <div className="flex items-center gap-2">
                  {t.active ? <CheckCircle2 size={14} className="text-red-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1.5" />}
                  <span className={`text-[10px] font-black uppercase tracking-wider ${t.active ? 'text-gray-900' : 'text-gray-500 line-through decoration-gray-300'}`}>{t.label}</span>
                </div>
                {t.active && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">{t.risk}</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Recommendation Engine */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="cyber-card col-span-1 bg-gradient-to-b from-blue-900 to-indigo-900 text-white border-transparent shadow-xl">
          <h3 className="text-[11px] font-black text-white tracking-widest uppercase mb-6 flex items-center gap-2"><Shield size={14}/> Recommendation Engine</h3>
          <div className="space-y-3">
            {[
              "Enforce strict null-routing for all detected suspicious outbound links.",
              "Enable mandatory Multi-Factor Authentication (MFA) across exposed vectors.",
              "Execute domain verification constraints on inbound mail gateways.",
              "Conduct immediate security awareness triage for compromised personnel."
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <ChevronRight size={14} className="text-blue-300 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-bold text-gray-100 leading-tight">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
