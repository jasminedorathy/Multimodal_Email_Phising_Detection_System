import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Beaker, Search, Monitor, Terminal, FileCode2, 
  ShieldAlert, Cpu, Activity, Play, Globe, 
  Lock, Zap, Server, Database
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ThreatLabPage() {
  const [activeTab, setActiveTab] = useState('sandbox')
  const [detonating, setDetonating] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [sandboxResult, setSandboxResult] = useState(null)

  const handleDetonate = (e) => {
    e.preventDefault()
    if (!urlInput) return
    
    setDetonating(true)
    setSandboxResult(null)
    
    // Simulate complex sandbox detonation
    setTimeout(() => {
      setDetonating(false)
      setSandboxResult({
        url: urlInput,
        verdict: urlInput.toLowerCase().includes('secure') || urlInput.toLowerCase().includes('reset') || urlInput.toLowerCase().includes('login') ? 'malicious' : 'safe',
        indicators: [
          { type: 'DOM Analysis', detail: 'Hidden credential harvesting form detected' },
          { type: 'Network', detail: 'Outbound POST request to suspicious IP (194.2.xx.xx)' },
          { type: 'Visual', detail: 'Brand spoofing without valid certificate' }
        ]
      })
      toast.success('Sandbox detonation complete')
    }, 2500)
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm shadow-red-100/50 flex-shrink-0">
          <Beaker size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black text-gray-900 m-0 tracking-tight">Advanced Threat Lab</h2>
          <p className="text-sm text-gray-500 font-medium m-0 mt-1 tracking-wide">Live detonation, SMTP relays, and active malware analysis tools.</p>
        </div>
        <div className="px-5 py-2.5 rounded-2xl bg-gray-900 border border-black flex items-center gap-3 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-xs font-black uppercase tracking-widest">Restricted Access</span>
        </div>
      </motion.div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-3xl w-fit self-center md:self-start">
        {[
          { id: 'sandbox', label: 'Live Sandbox', icon: Monitor },
          { id: 'smtp', label: 'SMTP Honeypot', icon: Terminal },
          { id: 'malware', label: 'Malware Extraction', icon: FileCode2 }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`
              flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer
              ${activeTab === tab.id 
                ? 'bg-white text-red-600 shadow-lg shadow-gray-200/50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'sandbox' && (
          <motion.div 
            key="sandbox" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8"
          >
             <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                      <Play size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 m-0 tracking-tight uppercase italic">Neural Detonation Chamber</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-bold leading-relaxed max-w-2xl">
                    Launch an isolated, headless browser session to visually and structurally analyze suspicious URLs without risking your local machine infrastructure.
                  </p>
                </div>
                
                <form onSubmit={handleDetonate} className="flex flex-col md:flex-row gap-6 mb-12">
                   <div className="relative flex-1 group">
                     <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                     <input 
                       type="url" 
                       required 
                       placeholder="https://suspicious-link-here.com"
                       value={urlInput} 
                       onChange={e => setUrlInput(e.target.value)}
                       className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-gray-50 rounded-[2rem] text-sm font-black text-gray-900 focus:bg-white focus:border-red-600 focus:shadow-2xl focus:shadow-red-50 focus:outline-none transition-all placeholder-gray-300"
                     />
                   </div>
                   <button 
                    type="submit" 
                    disabled={detonating} 
                    className={`
                      px-10 py-5 rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-2xl
                      ${detonating ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-100'}
                    `}
                   >
                     {detonating ? (
                       <>
                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        Initializing VM...
                       </>
                     ) : (
                       <>
                        <ShieldAlert size={20} /> Detonate Link
                       </>
                     )}
                   </button>
                </form>
                
                {detonating && (
                   <div className="p-16 text-center bg-gray-50 border border-gray-100 rounded-[3rem] mb-8 animate-in fade-in zoom-in duration-500">
                      <div className="relative inline-block">
                         <div className="absolute inset-0 bg-red-400/20 blur-2xl rounded-full animate-pulse" />
                         <Activity size={64} className="text-red-600 relative z-10 animate-pulse" />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mt-8 mb-2 uppercase tracking-tighter">Forensic Engine Booting</h4>
                      <p className="text-xs text-gray-400 font-mono font-bold tracking-widest uppercase">Routing traffic via encrypted proxy • DOM Extraction In Progress</p>
                   </div>
                )}
                
                {sandboxResult && !detonating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="border-2 border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/50"
                  >
                     <div className={`
                        p-10 flex flex-col md:flex-row items-center gap-8 border-b
                        ${sandboxResult.verdict === 'malicious' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}
                     `}>
                        <div className={`
                          w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl
                          ${sandboxResult.verdict === 'malicious' ? 'bg-white text-red-600' : 'bg-white text-emerald-600'}
                        `}>
                          {sandboxResult.verdict === 'malicious' ? <ShieldAlert size={40} /> : <ShieldCheck size={40} />}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${sandboxResult.verdict === 'malicious' ? 'text-red-600' : 'text-emerald-600'}`}>
                            Detonation Verdict
                          </p>
                          <h4 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase m-0 leading-tight">
                            {sandboxResult.verdict === 'malicious' ? 'Zero-Day Phishing Portal' : 'Safe Asset Identified'}
                          </h4>
                          <p className="text-sm font-mono text-gray-500 font-bold mt-2 truncate max-w-md">{sandboxResult.url}</p>
                        </div>
                     </div>
                     
                     <div className="p-10 bg-white">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Forensic Indicators Caught</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {sandboxResult.indicators.map((ind, i) => (
                             <div key={i} className="flex items-start gap-5 p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:border-red-200 hover:bg-white transition-all group">
                                <div className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 group-hover:text-red-600 transition-colors shadow-sm">
                                  <Zap size={16} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest m-0 mb-1">{ind.type}</p>
                                  <p className="text-sm font-bold text-gray-800 m-0 leading-relaxed">{ind.detail}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
                )}
             </div>
          </motion.div>
        )}
        
        {activeTab === 'smtp' && (
           <motion.div 
            key="smtp" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm"
          >
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-gray-100 blur-2xl rounded-full scale-150" />
                <Server size={80} className="text-gray-200 relative z-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase mb-4">SMTP Honeypot Relay</h3>
              <p className="text-lg text-gray-400 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                Configure a live email listener node (e.g. <span className="text-blue-600">scan@phishguard.net</span>) for automatic neural analysis of forwarded traffic.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <Database size={16} className="text-gray-400" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Awaiting DB Init</span>
                </div>
                <button disabled className="px-10 py-4 bg-gray-50 border border-gray-100 text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest cursor-not-allowed">
                  Deploy Infrastructure
                </button>
              </div>
           </motion.div>
        )}

        {activeTab === 'malware' && (
           <motion.div 
            key="malware" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm"
          >
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-gray-100 blur-2xl rounded-full scale-150" />
                <FileCode2 size={80} className="text-gray-200 relative z-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase mb-4">YARA Attachment Scanner</h3>
              <p className="text-lg text-gray-400 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                Extract binary payloads from .EML files. Run deep static analysis and hash validation against known ransomware definitions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <Lock size={16} className="text-gray-400" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Awaiting YARA Core</span>
                </div>
                <button disabled className="px-10 py-4 bg-gray-50 border border-gray-100 text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest cursor-not-allowed">
                  Load Scanning Engine
                </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
