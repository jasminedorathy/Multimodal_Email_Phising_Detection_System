import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'
import { Search, Bell, ChevronDown, LogOut, Settings, User, ShieldCheck } from 'lucide-react'

export default function Topbar({ title, subtitle }) {
  const user = useSelector((s) => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-extrabold text-gray-900 m-0 tracking-tight leading-none mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-400 font-medium m-0 tracking-wide">{subtitle}</p>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar (Optional, for professional look) */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-64 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-200">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none text-sm text-gray-600 focus:outline-none w-full"
          />
        </div>

        {/* Status badge */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 shadow-sm shadow-emerald-100/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Online</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all duration-200 group cursor-pointer">
          <Bell size={18} className="transition-transform group-hover:rotate-12" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`
              flex items-center gap-3 pl-2 pr-4 py-1.5 bg-gray-50 border rounded-xl transition-all duration-200 cursor-pointer
              ${showDropdown ? 'border-blue-200 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50'}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/20">
              {user?.name?.[0]?.toUpperCase() || 'J'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-bold text-gray-900 leading-tight m-0">
                {user?.name?.split(' ')[0] || 'Jasmine'}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold m-0 uppercase tracking-tighter">
                {user?.role || 'analyst'}
              </p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/50 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Jasmine Dorathy'}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate">{user?.email || 'jasminedorathyva@gmail.com'}</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 font-medium hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all duration-200 group">
                  <User size={16} className="text-gray-400 group-hover:text-blue-500" />
                  Profile Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all duration-200 group mt-1"
                >
                  <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
