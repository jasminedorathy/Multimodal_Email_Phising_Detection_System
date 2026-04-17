import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, token } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('All fields required')
    dispatch(loginUser(form))
  }

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative overflow-hidden flex-col justify-center px-20">
        {/* Background Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-50/50 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid-pattern bg-grid" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 m-0 tracking-tight">Multimodal Phishing Analysis</h1>
              <p className="text-indigo-600 text-[10px] font-black m-0 uppercase tracking-[0.2em]">Deep Neural Architecture</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-100 rounded-full px-5 py-2 mb-10 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest">Platform Operational</span>
          </div>

          <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
            Intercept Zero-Day <br />
            Threats With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Precision.</span>
          </h2>

          <p className="text-sm text-gray-500 font-bold leading-relaxed max-w-lg mb-12">
            An enterprise-scale intelligence pipeline integrating Computer Vision OCR, Deep NLP Semantics, and URL syntax heuristics to isolate malicious payloads before successful execution.
          </p>



          {/* Tag Cloud */}
          <div className="flex flex-wrap gap-3 mt-16">
            {['🧠 Multi-vector AI', '🔬 Forensic Analysis', '🛡 Enterprise Security'].map(tag => (
              <span key={tag} className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-500 uppercase tracking-tighter shadow-sm hover:border-blue-200 transition-all">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 italic uppercase">Welcome back</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Sign in to your neural dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-4 transition-all duration-200
                ${focused === 'email' ? 'border-blue-600 bg-white shadow-xl shadow-blue-50' : 'border-gray-50'}
              `}>
                <Mail size={18} className={focused === 'email' ? 'text-blue-600' : 'text-gray-300'} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="analyst@email-phishing-detection.system"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                <button type="button" className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-indigo-600 transition-colors">Forgot?</button>
              </div>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-4 transition-all duration-200
                ${focused === 'pass' ? 'border-blue-600 bg-white shadow-xl shadow-blue-50' : 'border-gray-50'}
              `}>
                <Lock size={18} className={focused === 'pass' ? 'text-blue-600' : 'text-gray-300'} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-2xl
                ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-indigo-700 shadow-blue-100'}
              `}
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={18} />
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Secure Forensic Access</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm font-bold text-gray-400">
            Don&apos;t have a forensic account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-indigo-600 transition-colors uppercase tracking-widest text-xs ml-1">
              Create one <ArrowRight size={12} className="inline ml-1" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
