import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Home, Camera, TrendingUp, Trophy, Sparkles } from 'lucide-react'

const navItems = [
  { path: '/app', icon: Home, label: 'Home' },
  { path: '/app/scan', icon: Camera, label: 'Scan' },
  { path: '/app/progress', icon: TrendingUp, label: 'Progress' },
  { path: '/app/achievements', icon: Trophy, label: 'Awards' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#080810]">
      {/* Top logo bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center py-3 glass border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-black text-base tracking-tight">CutMix</span>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-14">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 pb-safe">
        <div className="flex justify-around items-center py-2 max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${
                  active ? 'text-brand-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
