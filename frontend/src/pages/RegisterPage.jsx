import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Brain, ArrowRight, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [focused, setFocused] = useState(null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('All fields required')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }))
    if (result.type.endsWith('fulfilled') && result.payload?.token) {
      toast.success('Account created! Welcome to Multimodal Email Phishing Detection System.')
      navigate('/dashboard')
    } else if (result.type.endsWith('fulfilled')) {
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } else {
      toast.error(result.payload || 'Registration failed')
    }
  }

  const pwStrength = (pw) => {
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const strength = pwStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'][strength]

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative overflow-hidden flex-col justify-center px-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-50/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />
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

          <div className="space-y-6">
            {[
              { icon: Brain, title: 'Multimodal AI Engine', desc: 'Analyzing Text, URL, and Visual vectors.', color: 'purple' },
              { icon: Zap, title: 'Real-time Detonation', desc: 'Sub-second classification latency.', color: 'blue' },
              { icon: ShieldCheck, title: 'Explainable Forensic', desc: 'SHAP-powered threat explainability.', color: 'emerald' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-5 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-purple-200 transition-all group">
                <div className={`w-12 h-12 rounded-2xl bg-${f.color}-50 flex items-center justify-center text-${f.color}-600 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <div>
                  <p className="text-gray-900 font-black text-sm uppercase tracking-tight m-0">{f.title}</p>
                  <p className="text-gray-400 text-xs font-bold m-0 mt-1">{f.desc}</p>
                </div>
              </div>
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
          <div className="mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 italic uppercase">Create Account</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Enroll in the neural network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-3.5 transition-all duration-200
                ${focused === 'name' ? 'border-purple-600 bg-white shadow-xl shadow-purple-50' : 'border-gray-50'}
              `}>
                <User size={18} className={focused === 'name' ? 'text-purple-600' : 'text-gray-300'} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Senior Analyst"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-3.5 transition-all duration-200
                ${focused === 'email' ? 'border-purple-600 bg-white shadow-xl shadow-purple-50' : 'border-gray-50'}
              `}>
                <Mail size={18} className={focused === 'email' ? 'text-purple-600' : 'text-gray-300'} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="analyst@company.com"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-3.5 transition-all duration-200
                ${focused === 'password' ? 'border-purple-600 bg-white shadow-xl shadow-purple-50' : 'border-gray-50'}
              `}>
                <Lock size={18} className={focused === 'password' ? 'text-purple-600' : 'text-gray-300'} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-300 hover:text-purple-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength Meter */}
              {form.password && (
                <div className="px-1 mt-2">
                  <div className="flex gap-1.5 h-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 rounded-full transition-all duration-500" style={{ background: i <= strength ? strengthColor : '#F1F5F9' }} />
                    ))}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1.5" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Access Key</label>
              <div className={`
                flex items-center gap-3 bg-gray-50 border-2 rounded-2xl px-5 py-3.5 transition-all duration-200
                ${focused === 'confirm' ? 'border-purple-600 bg-white shadow-xl shadow-purple-50' : 'border-gray-50'}
                ${form.confirm && form.confirm !== form.password ? 'border-red-400' : ''}
              `}>
                <Lock size={18} className={focused === 'confirm' ? 'text-purple-600' : 'text-gray-300'} />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none w-full placeholder-gray-300"
                />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1 mt-1">Keys do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-2xl mt-4
                ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-indigo-700 shadow-purple-100'}
              `}
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : 'Initialize Security Account'}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-8">
            By initializing you agree to Neural Protocols
          </p>

          <p className="text-center text-sm font-bold text-gray-400 mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-indigo-600 transition-colors uppercase tracking-widest text-xs ml-1">
              Sign In <ArrowRight size={12} className="inline ml-1" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
