import { useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const pageMeta = {
  '/dashboard':   { title: 'Security Dashboard', subtitle: 'Real-time threat overview & detection metrics' },
  '/analyze':     { title: 'Email Analysis', subtitle: 'Analyze emails for phishing threats' },
  '/analytics':   { title: 'Analytics', subtitle: 'Historical trends & threat intelligence' },
  '/ai-insights': { title: 'AI Insights', subtitle: 'Machine learning patterns & behavioral analysis' },
  '/history':     { title: 'Logs & History', subtitle: 'Complete audit trail of analyzed emails' },
  '/profile':     { title: 'Profile', subtitle: 'Manage your user profile and settings' },
  '/integrations':{ title: 'Threat Lab', subtitle: 'Advanced threat simulation & integrations' },
  '/result':      { title: 'Detection Result', subtitle: 'Full phishing analysis report' },
}

export default function MainLayout() {
  const { sidebarCollapsed } = useSelector((s) => s.ui)
  const location = useLocation()
  const meta = pageMeta[location.pathname] || { title: 'Multimodal Email Phishing Detection System', subtitle: '' }
  
  // Align widths with Sidebar.jsx
  const sidebarW = sidebarCollapsed ? '88px' : '260px'

  return (
    <div className="flex min-h-screen bg-cyber-bg font-sans">
      <Sidebar />

      <main 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg-grid-pattern bg-grid"
        style={{ marginLeft: sidebarW }}
      >
        <Topbar title={meta.title} subtitle={meta.subtitle} />

        <div className="flex-1 p-8 overflow-x-hidden">
          <div
            key={location.pathname}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
