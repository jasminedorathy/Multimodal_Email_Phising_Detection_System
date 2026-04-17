import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { toggleSidebar } from '../redux/slices/uiSlice'
import { logout } from '../redux/slices/authSlice'
import { 
  LayoutDashboard, 
  Shield, 
  BarChart3, 
  Activity, 
  Beaker, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ShieldAlert,
  Brain,
  Mail,
  History,
  User,
  Zap
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Mail, label: 'Analyze Email' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
  { to: '/history', icon: History, label: 'Logs & History' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarCollapsed } = useSelector((s) => s.ui)
  const { user } = useSelector((s) => s.auth)
  
  const [hoveredLink, setHoveredLink] = useState(null)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Sidebar width matches MainLayout
  const sidebarWidth = sidebarCollapsed ? '88px' : '260px'

  return (
    <div className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50 overflow-hidden font-sans"
      style={{ width: sidebarWidth }}>
      
      {/* Brand Header */}
      <div className={`h-20 flex items-center border-b border-gray-100 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'justify-center px-4' : 'justify-between px-6'}`}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 min-width-max">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <ShieldAlert size={22} color="white" />
            </div>
            <div className="flex-1">
              <h1 className="text-gray-900 font-black text-[13px] m-0 leading-tight tracking-tight">Multimodal Phishing</h1>
              <p className="text-gray-900 font-black text-[11px] m-0 mb-1 leading-tight tracking-widest uppercase">Detection System</p>
              <p className="text-indigo-600 text-[8px] font-black m-0 uppercase tracking-widest leading-none">AI-Powered Multimodal Threat Intelligence Platform</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <ShieldAlert size={22} color="white" />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => dispatch(toggleSidebar())} 
        className={`absolute top-6 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:border-blue-400 hover:text-blue-500 shadow-sm ${sidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}
      >
        <ChevronLeft size={14} />
      </button>

      {/* System Status Pill */}
      {!sidebarCollapsed && (
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-xs font-bold tracking-wide">System Active</span>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="text-gray-400 text-[11px] font-extrabold uppercase tracking-widest px-3 mb-3">
            Navigation
          </div>
        )}
        
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink 
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group
                ${sidebarCollapsed ? 'justify-center' : 'justify-start'}
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-bold shadow-sm shadow-blue-100/50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} 
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <motion.div 
                      layoutId="activePill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm shadow-blue-400/50" 
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>

      {/* User / Footer */}
      <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="m-0 font-bold text-[13px] text-gray-900 truncate leading-none mb-1">
                {user?.name || 'jasminedorathyva...'}
              </p>
              <p className="m-0 text-[11px] text-gray-500 truncate font-medium">
                {user?.role || 'analyst'}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogout} 
            className="w-full py-3 flex justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
