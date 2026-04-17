import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { analyzeEmail } from '../redux/slices/analysisSlice'
import { 
  Link2, Image as ImageIcon, Brain, X, 
  Plus, AlertTriangle, CheckCircle, Upload, Fingerprint, Mail, 
  ShieldCheck, ShieldAlert, Activity, AlertCircle, Radar, ScanLine
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnalyzePage() {
  const dispatch = useDispatch()
  const { loading } = useSelector((s) => s.analysis)
  
  const [text, setText] = useState('')
  const [urls, setUrls] = useState([])
  const [urlInput, setUrlInput] = useState('')
  const [file, setFile] = useState(null)
  const [emlFile, setEmlFile] = useState(null)
  const [metadata, setMetadata] = useState({ from: '', to: '', subject: '', replyTo: '' })
  const [persuasion, setPersuasion] = useState([])
  const [liveResult, setLiveResult] = useState(null)

  // Clear backend result if user starts editing heavily again
  useEffect(() => {
    if (liveResult && text.length > 0) {
      // Optional: Could clear result, but maybe user wants to see it while tweaking.
    }
  }, [text, liveResult])

  // --- LIVE HEURISTICS SCANNER (Frontend Only) ---
  const suspiciousKeywords = ['urgent', 'immediately', 'verify', 'password', 'login', 'suspend', 'blocked', 'unauthorized', 'click here', 'billing', 'invoice', 'update your account', 'action required']
  
  const { liveScore, liveWords, hasInput } = useMemo(() => {
    let score = 5;
    const words = new Set()
    const lowerText = text.toLowerCase()
    
    suspiciousKeywords.forEach(w => {
      if (lowerText.includes(w)) {
        score += 8;
        words.add(w);
      }
    })

    if (urls.some(u => u.includes('xyz') || u.includes('top') || u.includes('click') || /\d+\.\d+\.\d+\.\d+/.test(u))) score += 25;
    if (metadata.from && !metadata.from.includes('@') && metadata.from.length > 0) score += 10;
    
    const spoofCheck = ['paypal', 'apple', 'microsoft', 'google', 'amazon', 'bank']
    spoofCheck.forEach(brand => {
      if (metadata.from.toLowerCase().includes(brand) && !metadata.from.toLowerCase().includes(`${brand}.com`)) {
        score += 30; // Brand mention without domain
      }
    })

    score += (persuasion.length * 10);
    if (file) score += 5; // Image OCR potential risk addition

    const finalScore = Math.min(Math.max(score, 0), 99);
    
    return {
      liveScore: finalScore,
      liveWords: Array.from(words),
      hasInput: text.trim().length > 0 || urls.length > 0 || file || emlFile || metadata.from.trim().length > 0
    }
  }, [text, urls, metadata, persuasion, file, emlFile])

  const liveRiskLevel = liveScore >= 70 ? 'CRITICAL' : liveScore >= 40 ? 'HIGH' : liveScore >= 15 ? 'MEDIUM' : 'LOW'
  const liveRiskColor = liveScore >= 70 ? 'text-red-600' : liveScore >= 40 ? 'text-orange-600' : liveScore >= 15 ? 'text-amber-500' : 'text-emerald-500'

  // Auto-detect URLs
  useEffect(() => {
    if (!text.trim()) return
    const urlRegex = /https?:\/\/[^\s]+/g
    const foundUrls = text.match(urlRegex) || []
    if (foundUrls.length > 0) {
      setUrls(prev => [...new Set([...prev, ...foundUrls])].slice(0, 10))
    }
  }, [text])

  // Dropzone behaviors
  const onDropImage = useCallback((accepted) => { if (accepted[0]) setFile(accepted[0]); setLiveResult(null) }, [])
  const onDropEml = useCallback((accepted) => { if (accepted[0]) setEmlFile(accepted[0]); setLiveResult(null) }, [])

  const { getRootProps: getImgProps, getInputProps: getImgInputProps, isDragActive: isImgDrag } = useDropzone({ onDrop: onDropImage, accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, maxFiles: 1 })
  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropEml, accept: { 'message/rfc822': ['.eml'], 'application/vnd.ms-outlook': ['.msg'] }, maxFiles: 1 })

  const handleAddUrl = () => {
    if (urlInput && !urls.includes(urlInput)) {
      setUrls([...urls, urlInput])
      setUrlInput('')
      setLiveResult(null)
    }
  }

  const togglePersuasion = (tag) => {
    setPersuasion(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    setLiveResult(null)
  }

  const handleAnalyze = async () => {
    if (!hasInput) return toast.error('Please provide input to analyze')
    toast.loading('Initiating Deep Threat Scan...', { id: 'analyze' })
    try {
      const payload = { text, urls, image: file, file: emlFile, metadata, persuasion }
      const result = await dispatch(analyzeEmail(payload)).unwrap()
      toast.success('Neural scan complete', { id: 'analyze' })
      setLiveResult(result)
    } catch (error) {
      toast.error(error || 'Analysis failed', { id: 'analyze' })
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
          <ScanLine size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 m-0 tracking-tight uppercase">AI Threat Inspection Workspace</h2>
          <p className="text-sm text-gray-500 font-bold m-0 mt-1 tracking-wide">Real-time multimodal pipeline for detecting zero-day injection attacks.</p>
        </div>
      </motion.div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: DATA INPUT & TARGET VECTORS                  */}
        {/* ======================================================== */}
        <div className="flex flex-col gap-6">
          
          {/* TEXT PAYLOAD INPUT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shadow-sm"><Mail size={16} /></div>
                <h3 className="text-xs font-black text-gray-900 m-0 tracking-widest uppercase">Text Payload</h3>
              </div>
              <div className="flex items-center gap-4">
                {liveWords.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100 animate-pulse">
                    <AlertCircle size={10} /> {liveWords.length} Flags Detected
                  </span>
                )}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{text.length} Chars</span>
              </div>
            </div>
            <textarea
              value={text} onChange={(e) => { setText(e.target.value); setLiveResult(null); }}
              placeholder="Paste raw email body here for deep NLP inspection..."
              className="w-full min-h-[220px] px-6 py-6 border-none bg-white text-sm font-medium text-gray-800 placeholder-gray-300 resize-y focus:ring-0 focus:outline-none leading-relaxed custom-scrollbar"
            />
            {liveWords.length > 0 && (
              <div className="bg-red-50/30 px-6 py-3 border-t border-red-50 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mr-2">Live Syntax Matches:</span>
                {liveWords.map(w => (
                  <span key={w} className="px-2 py-1 bg-white border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                    {w}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* EXTRACTED URLS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600 shadow-sm"><Link2 size={16} /></div>
                <h3 className="text-xs font-black text-gray-900 m-0 tracking-widest uppercase">Extracted URLs</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
                  placeholder="Analyze specific domain..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                />
                <button 
                  onClick={handleAddUrl} 
                  className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {urls.length === 0 && <p className="text-center text-[10px] py-4 font-black uppercase text-gray-300 tracking-widest border-2 border-dashed border-gray-50 rounded-xl">No URLs Identified</p>}
                {urls.map(u => {
                  const isRisky = u.includes('xyz') || u.includes('top') || /\d+\.\d+\.\d+\.\d+/.test(u);
                  return (
                    <div key={u} className="group relative flex flex-col p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-purple-200 transition-colors shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-600 truncate mr-3">{u}</span>
                        <button onClick={() => setUrls(urls.filter(x => x !== u))} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                      {isRisky && (
                        <div className="mt-2 text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                          <AlertTriangle size={10} /> Suspicious Domain Mask Detected
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* VISUAL EVIDENCE */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-pink-100 rounded-xl text-pink-600 shadow-sm"><ImageIcon size={16} /></div>
                <h3 className="text-xs font-black text-gray-900 m-0 tracking-widest uppercase">Visual Evidence</h3>
              </div>
              {!file ? (
                <div 
                  {...getImgProps()} 
                  className={`border-2 border-dashed rounded-2xl h-[120px] flex flex-col items-center justify-center transition-all cursor-pointer ${isImgDrag ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-300 hover:bg-pink-50/50'}`}
                >
                  <input {...getImgInputProps()} />
                  <Upload size={20} className="text-gray-300 mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drop Screenshot Here</p>
                </div>
              ) : (
                <div className="relative h-[120px] rounded-2xl border border-gray-100 overflow-hidden bg-gray-900 group">
                  <img src={URL.createObjectURL(file)} className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-3 pointer-events-none">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Visual OCR Active</span>
                  </div>
                  <button onClick={() => {setFile(null); setLiveResult(null)}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors"><X size={12} /></button>
                </div>
              )}
            </motion.div>

            {/* HEADER METADATA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shadow-sm"><Fingerprint size={16} /></div>
                <h3 className="text-xs font-black text-gray-900 m-0 tracking-widest uppercase">Header Metadata</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                   <input type="text" placeholder="From: billing@paypal.com" value={metadata.from} onChange={e=>{setMetadata({...metadata, from: e.target.value}); setLiveResult(null)}} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-amber-200" />
                   {metadata.from.toLowerCase().includes('paypal') && !metadata.from.includes('paypal.com') && (
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500"><AlertTriangle size={14} /></span>
                   )}
                </div>
                <input type="text" placeholder="Subject: Action Required" value={metadata.subject} onChange={e=>{setMetadata({...metadata, subject: e.target.value}); setLiveResult(null)}} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-amber-200" />
              </div>
            </motion.div>

            {/* PSYCHOLOGICAL VECTORS (Semantic Tags) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm"><Brain size={16} /></div>
                <h3 className="text-xs font-black text-gray-900 m-0 tracking-widest uppercase">Persuasion Signals</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'urgency', label: 'Urgency', activeClass: 'bg-red-500 text-white border-red-600 shadow-red-200' },
                  { id: 'fear', label: 'Fear', activeClass: 'bg-orange-500 text-white border-orange-600 shadow-orange-200' },
                  { id: 'reward', label: 'Reward', activeClass: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200' },
                  { id: 'authority', label: 'Authority', activeClass: 'bg-blue-500 text-white border-blue-600 shadow-blue-200' }
                ].map(tag => {
                  const isActive = persuasion.includes(tag.id);
                  return (
                    <button 
                      key={tag.id} onClick={() => togglePersuasion(tag.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${isActive ? tag.activeClass + ' scale-105' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>

          </div>

          {/* MASTER ANALYZE BUTTON */}
          <motion.button 
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAnalyze} disabled={loading}
            className={`mt-4 w-full relative overflow-hidden rounded-3xl shadow-2xl shadow-indigo-500/20 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-indigo-500/40'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 ${loading ? 'animate-pulse' : ''}`} />
            <div className="relative z-10 px-8 py-6 flex items-center justify-center gap-4 text-white">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Executing Deep Neural Scan...</span>
                </>
              ) : (
                <>
                  <Activity size={24} />
                  <span className="text-sm font-black uppercase tracking-[0.2em] drop-shadow-md">Initiate Deep Threat Scan</span>
                </>
              )}
            </div>
          </motion.button>
        </div>


        {/* ======================================================== */}
        {/* RIGHT PANEL: AI OUTPUT / PREVIEW / RESULTS               */}
        {/* ======================================================== */}
        <div className="sticky top-8">
          
          <AnimatePresence mode="wait">
            
            {/* STATE 1: EMPTY (No Input) */}
            {!hasInput && !loading && !liveResult && (
              <motion.div key="empty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="h-[600px] border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg border border-gray-50 flex items-center justify-center text-gray-200 mb-6">
                  <Radar size={48} className="animate-[spin_4s_linear_infinite]" />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Awaiting Payload</h3>
                <p className="text-xs font-bold text-gray-400 max-w-[250px] leading-relaxed">Provide text, raw EML headers, or visual screenshots to initiate live AI phishing telemetry.</p>
              </motion.div>
            )}

            {/* STATE 2: LIVE PREVIEW (Typing, Before Submit) */}
            {hasInput && !loading && !liveResult && (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white border border-gray-800">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Activity size={18} /></div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white m-0">Live Telemetry</h3>
                    <p className="text-[9px] text-blue-400 uppercase tracking-widest mt-0.5">Pre-scan heuristic envelope</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calculated Risk Index</span>
                  <span className={`text-3xl font-black italic tracking-tighter ${liveRiskColor}`}>{liveScore}%</span>
                </div>
                
                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 mb-2">
                  <motion.div animate={{ width: `${liveScore}%` }} transition={{ type: 'spring', stiffness: 50 }} className={`h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500`} />
                </div>
                <div className="text-right text-[9px] font-black uppercase tracking-widest text-gray-500 mb-10">Severity: {liveRiskLevel}</div>

                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2"><ScanLine size={12} /> Active Heuristics</p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-xs font-bold">
                      <span className="text-red-300">Semantic Malice</span>
                      <span className="text-white">{liveWords.length ? `High (${liveWords.length} flags)` : 'Clear'}</span>
                    </li>
                    <li className="flex items-center justify-between text-xs font-bold">
                      <span className="text-orange-300">Link Integrity</span>
                      <span className="text-white">{urls.length > 0 ? 'Analyzing...' : 'None extracted'}</span>
                    </li>
                    <li className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-300">Header Validation</span>
                      <span className="text-white">{metadata.from ? 'Inspecting origin' : 'Awaiting data'}</span>
                    </li>
                  </ul>
                </div>

                <div className="absolute -bottom-10 -right-10 opacity-5 blur-sm pointer-events-none"><Brain size={250} /></div>
              </motion.div>
            )}

            {/* STATE 3: LOADING BACKEND SKELETON */}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col gap-8 h-full">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex flex-col gap-2">
                       <div className="flex justify-between"><div className="h-2 w-24 bg-gray-50 rounded" /><div className="h-2 w-8 bg-gray-50 rounded" /></div>
                       <div className="h-1.5 w-full bg-gray-50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-32 bg-gray-50 rounded-2xl animate-pulse" />
              </motion.div>
            )}

            {/* STATE 4: DEEP SCAN RESULT */}
            {liveResult && !loading && (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl shadow-gray-200/50">
                
                {/* Prediction Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Forensic Verdict</h3>
                    <div className="flex items-center gap-3">
                      {liveResult.label === 'Phishing' ? (
                        <div className="flex items-center gap-3 text-red-600">
                          <div className="p-3 bg-red-50 rounded-2xl border border-red-100"><ShieldAlert size={28} /></div>
                          <div>
                            <span className="text-3xl font-black tracking-tighter uppercase italic leading-none block">Phishing</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Critical Threat Detected</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-emerald-600">
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100"><ShieldCheck size={28} /></div>
                          <div>
                            <span className="text-3xl font-black tracking-tighter uppercase italic leading-none block">Safe Asset</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">No immediate risk</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Confidence</p>
                    <p className={`text-4xl font-black italic tracking-tighter leading-none ${liveResult.label === 'Phishing' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {(liveResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Risk Meter */}
                <div className="mb-10">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    <span>Low</span><span>Med</span><span>High</span><span>Crit</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${liveResult.confidence * 100}%` }} transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full rounded-full ${liveResult.label === 'Phishing' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                    />
                  </div>
                </div>

                {/* High Risk Alert Banner */}
                {liveResult.label === 'Phishing' && (
                  <div className="mb-10 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                       <AlertCircle size={20} className="text-red-500 flex-shrink-0 animate-pulse" />
                       <span className="text-[11px] font-bold text-red-900 leading-tight">High Risk Email Detected. <br/><span className="font-black">Do NOT click any internal links.</span></span>
                     </div>
                  </div>
                )}

                {/* Explainable AI Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  
                  {/* Top Reasons */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Top Risk Factors</h4>
                    <ul className="space-y-3">
                      {liveResult.reasons?.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 group">
                          <span className="mt-0.5 text-orange-500"><AlertTriangle size={12} /></span>
                          <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">
                            {r.reason} <span className="font-black text-orange-600 italic">(+{(r.impact || 15)}%)</span>
                          </span>
                        </li>
                      ))}
                      {(!liveResult.reasons || liveResult.reasons.length === 0) && (
                        <li className="text-[11px] font-bold text-gray-400">Standard heuristic baselines matched.</li>
                      )}
                    </ul>
                  </div>

                  {/* Feature Bars */}
                  <div>
                     <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Vector Scores</h4>
                     <div className="space-y-3">
                        {[
                          { label: 'Text Semantics', score: liveResult.details?.textScore || 0, colorClass: 'bg-blue-500' },
                          { label: 'URL Payloads', score: liveResult.details?.urlScore || 0, colorClass: 'bg-purple-500' },
                          { label: 'Sender Meta', score: liveResult.details?.metaScore || 0, colorClass: 'bg-amber-500' },
                          { label: 'Psych Intent', score: liveResult.details?.behaviorScore || 0, colorClass: 'bg-red-500' },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[9px] font-black uppercase text-gray-500 mb-1">
                              <span>{item.label}</span>
                              <span className="italic">{item.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 0.5, duration: 1 }} className={`h-full ${item.colorClass} rounded-full`} />
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Sanitized Output */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4 flex items-center justify-between">
                    <span>Sanitized Forensic Payload</span>
                    {liveResult.details?.signatures?.length > 0 && (
                       <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-2 rounded-md">{liveResult.details.signatures.length} NLP flags</span>
                    )}
                  </h4>
                  <div className="bg-gray-50 border border-gray-100/80 rounded-2xl p-5 max-h-48 overflow-y-auto custom-scrollbar relative">
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed font-mono tracking-tight whitespace-pre-wrap selection:bg-purple-200">
                      {liveResult.details?.sanitizedText || text || 'Payload extraction failed or empty.'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-4">Recommended Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {liveResult.recommendations?.map((r, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg pointer-events-none">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">
                  <span>ID: {liveResult.id}</span>
                  <span>{new Date(liveResult.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
