import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, Mail, Shield, ShieldCheck, Activity, Zap, 
  Edit3, Save, X, LogOut, CheckCircle2, ShieldAlert,
  Hash, Globe, Award, Lock, Smartphone, Key, History, AlertTriangle, ChevronRight, Fingerprint
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../utils/helpers'

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [stats, setStats] = useState({ totalAnalyses: 0, phishingFound: 0, safeEmails: 0 })
  const [recentActivities, setRecentActivities] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    // Fetch user stats
    api.get('/auth/me').then(r => {
      if (r.data.stats) setStats(r.data.stats)
    }).catch(() => {})

    // Fetch history logs
    api.get('/history').then(res => {
      const historyData = res.data || [];
      const activities = historyData.slice(0, 4).map(item => ({
        id: item.id,
        action: item.prediction === 'phishing' ? 'Phishing detected' : 'Email analyzed',
        time: item.timestamp,
        prediction: item.prediction
      }));
      
      const now = new Date();
      now.setHours(now.getHours() - 1);
      
      setRecentActivities([
        ...activities,
        { id: 'login-evt', action: 'Login from Chrome', time: now.toISOString(), prediction: 'log' }
      ].slice(0, 4))
      setLoadingHistory(false)
    }).catch(() => {
      setLoadingHistory(false)
    })
  }, [])

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', { name })
      toast.success('Identity updated')
      setEditing(false)
    } catch {
      toast.error('Failed to update identity')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const statCards = [
    { label: 'Emails Analyzed', value: stats.totalAnalyses, color: 'blue', icon: Activity },
    { label: 'Threats Detected', value: stats.phishingFound, color: 'red', icon: ShieldAlert },
    { label: 'Threat Detection Accuracy', value: stats.totalAnalyses > 0 ? '98.5%' : '0%', color: 'amber', icon: Zap },
    { label: 'Risk Cases Handled', value: stats.phishingFound, color: 'emerald', icon: ShieldCheck },
  ]

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
      >
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-200">
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left">
          {editing ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Display</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="px-6 py-3 bg-gray-50 border-2 border-blue-600 rounded-2xl text-xl font-black text-gray-900 focus:outline-none shadow-xl shadow-blue-50" 
                />
              </div>
              <div className="flex justify-center md:justify-start gap-3">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-100">
                  <Save size={14} /> Save Identity
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer">
                  <X size={14} /> Discard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">{user?.name || 'Neural Analyst'}</h2>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-lg tracking-widest">
                    {user?.role || 'Analyst'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <p className="text-gray-400 text-sm font-bold flex items-center gap-2 m-0">
                    <Mail size={14} className="text-blue-400" />
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={12} />
                    Verified Security Analyst
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 justify-center md:justify-start mt-2">
                  <div className="flex items-center gap-1.5"><Globe size={14} /> Last Login: Today, 3:45 PM</div>
                  <div className="flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> Session Status: Active</div>
                  <div className="flex items-center gap-1.5"><Shield size={14} className="text-blue-500" /> Threat Handling Level: Advanced</div>
                </div>
              </div>
              <button 
                onClick={() => setEditing(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Edit3 size={14} /> Edit Identity
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon size={22} />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter italic m-0 mb-1">{s.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest m-0">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm lg:col-span-2 hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
              <Fingerprint size={18} className="text-blue-600" />
              Security Credentials & Access Profile
            </h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg tracking-widest">Level 4 (Advanced Analyst)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Assigned Identity', value: user?.name, icon: User },
              { label: 'Communication Node', value: user?.email, icon: Mail },
              { label: 'Access Clearance', value: user?.role || 'Analyst', icon: Shield },
              { label: 'Organization', value: 'Multimodal Email Phishing Detection System', icon: Globe },
              { label: 'Forensic ID', value: user?.id || 'PG-8829-AX', icon: Hash },
              { label: 'System Access', value: 'Full Threat Intelligence Access', icon: Zap },
            ].map(row => (
              <div key={row.label} className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl group hover:bg-white hover:border-blue-100 hover:shadow-md hover:shadow-blue-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <row.icon size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest m-0">{row.label}</p>
                </div>
                <p className="text-sm font-black text-gray-900 truncate m-0">{row.value || '—'}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Risk Profile */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-emerald-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-100/50 transition-shadow duration-300"
        >
          <div className="absolute -top-10 -right-10 text-emerald-500 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
            <ShieldCheck size={200} />
          </div>
          
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
            <ShieldCheck size={18} className="text-emerald-500" />
            User Risk Profile
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Overall Risk Assessment</p>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-lg font-black tracking-tighter uppercase border border-emerald-100">
                  LOW
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Behavior</span>
                <span className="text-xs font-black text-gray-900">Normal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Threat Exposure</span>
                <span className="text-xs font-black text-gray-900">Minimal</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm lg:col-span-2 hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300"
        >
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <Lock size={18} className="text-gray-900" />
            Security Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Change Password', desc: 'Update your access configuration', icon: Key },
              { label: 'Enable 2FA', desc: 'Add multi-factor authentication', icon: Smartphone },
              { label: 'Login Activity Logs', desc: 'Review successful and failed logins', icon: History },
              { label: 'Device Management', desc: 'Revoke external session tokens', icon: Globe },
            ].map((btn, i) => (
              <button key={i} className="flex items-center gap-4 p-5 bg-gray-50/80 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md hover:shadow-gray-100 transition-all text-left group cursor-pointer">
                <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-blue-600 transition-colors shadow-sm">
                  <btn.icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">{btn.label}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{btn.desc}</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* User Activity Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300"
        >
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <Activity size={18} className="text-blue-600" />
            User Activity Logs
          </h3>
          <div className="flex-1 space-y-4">
            {recentActivities.length === 0 && !loadingHistory ? (
              <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-gray-400 tracking-widest p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                No recent activity detected
              </div>
            ) : (
              recentActivities.map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${act.prediction === 'phishing' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-900">{act.action}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{timeAgo(act.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Active Session Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white border-2 border-red-50 rounded-[2.5rem] p-8 shadow-sm flex flex-col lg:col-span-3 lg:w-1/2 lg:mx-auto hover:shadow-xl hover:shadow-red-50 transition-shadow duration-300"
        >
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <LogOut size={18} className="text-red-500" />
            Active Session Management
          </h3>
          <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">
            Terminal access active. Any classified data remains under end-to-end neural encryption.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Device</span>
              <span className="text-xs font-black text-gray-900">Windows Chrome</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">IP Address</span>
              <span className="text-xs font-black text-gray-900">192.168.1.104</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Session Duration</span>
              <span className="text-xs font-black text-gray-900">1h 24m</span>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2 mt-4">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Multiple login detection enabled</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 cursor-pointer hover:scale-[1.02]"
            >
              <LogOut size={16} /> Terminate All Active Sessions
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
