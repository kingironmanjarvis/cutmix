import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Camera, TrendingUp, Trophy, Star, ChevronRight, Zap, Clock } from 'lucide-react'

interface Scan {
  id: string
  cutmix_score: number
  created_at: string
  tier: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }
      setUser(user)

      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setScans(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const bestScore = scans.length ? Math.max(...scans.map(s => s.cutmix_score)) : null
  const latestScore = scans[0]?.cutmix_score || null
  const improvement = scans.length > 1 ? scans[0].cutmix_score - scans[scans.length - 1].cutmix_score : null

  function getTierColor(score: number) {
    if (score >= 85) return 'text-gold-400'
    if (score >= 75) return 'text-purple-400'
    if (score >= 61) return 'text-brand-400'
    if (score >= 41) return 'text-emerald-400'
    return 'text-white/50'
  }

  function getTier(score: number) {
    if (score >= 85) return 'Elite'
    if (score >= 75) return 'Sharp'
    if (score >= 61) return 'Attractive'
    if (score >= 41) return 'Solid'
    return 'Developing'
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080810] pb-20">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-white/40 text-sm">Welcome back</p>
              <h1 className="text-2xl font-black">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'} 👋</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold">
              {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Latest Score', value: latestScore ? latestScore.toString() : '—', sub: latestScore ? getTier(latestScore) : 'No scans yet' },
              { label: 'Best Score', value: bestScore ? bestScore.toString() : '—', sub: bestScore ? getTier(bestScore) : 'Scan to start' },
              { label: 'Improvement', value: improvement !== null ? `+${improvement}` : '—', sub: improvement !== null ? 'points gained' : 'Keep scanning' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-4"
              >
                <div className="text-2xl font-black gradient-text">{card.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{card.label}</div>
                <div className="text-xs text-white/25 mt-0.5">{card.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Scan CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/app/scan')}
            className="w-full bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity glow-brand mb-6"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera size={22} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-white">New Scan</div>
              <div className="text-sm text-white/60">{scans.length === 0 ? 'Get your first CutMix Score' : 'Analyze & track your progress'}</div>
            </div>
            <ChevronRight size={20} className="text-white/60" />
          </motion.button>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button onClick={() => navigate('/app/progress')} className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition-colors">
              <TrendingUp size={18} className="text-emerald-400" />
              <span className="text-sm font-medium">Progress</span>
            </button>
            <button onClick={() => navigate('/app/achievements')} className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition-colors">
              <Trophy size={18} className="text-gold-400" />
              <span className="text-sm font-medium">Achievements</span>
            </button>
          </div>

          {/* Scan history */}
          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock size={18} className="text-white/40" />
              Scan History
            </h2>

            {scans.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-white/45 text-sm">No scans yet. Take your first scan to get your CutMix Score!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scans.map((scan, i) => (
                  <motion.button
                    key={scan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/app/report/${scan.id}`)}
                    className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center">
                      <span className="text-sm font-black">{scan.cutmix_score}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">{getTier(scan.cutmix_score)} Tier</div>
                      <div className="text-xs text-white/35">{formatDate(scan.created_at)}</div>
                    </div>
                    <div className={`text-sm font-bold ${getTierColor(scan.cutmix_score)}`}>
                      {scan.cutmix_score}/100
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
