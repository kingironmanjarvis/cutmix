import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Progress() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }

      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setScans(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const chartData = scans.map((s, i) => ({
    scan: `#${i + 1}`,
    score: s.cutmix_score,
    symmetry: s.symmetry_score,
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const trend = scans.length > 1
    ? scans[scans.length - 1].cutmix_score - scans[0].cutmix_score
    : 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-xl p-3 text-xs">
          <p className="font-bold text-white">{payload[0].value} / 100</p>
          <p className="text-white/40">{payload[0].payload.date}</p>
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080810] pb-20">
      <div className="max-w-md mx-auto px-6 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/app')} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-black">Progress Tracker</h1>
        </div>

        {scans.length < 2 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold mb-2">Not enough data yet</h3>
            <p className="text-white/40 text-sm mb-4">Complete at least 2 scans to see your progress chart.</p>
            <button onClick={() => navigate('/app/scan')} className="btn-primary text-sm py-2.5 px-6">
              Take a Scan
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-black gradient-text">{scans.length}</div>
                <div className="text-xs text-white/35">Total Scans</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-black gradient-text">{Math.max(...scans.map(s => s.cutmix_score))}</div>
                <div className="text-xs text-white/35">Peak Score</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className={`text-xl font-black flex items-center justify-center gap-1 ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/50'}`}>
                  {trend > 0 ? <TrendingUp size={16} /> : trend < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                  {Math.abs(trend)}
                </div>
                <div className="text-xs text-white/35">Total Change</div>
              </div>
            </div>

            {/* Chart */}
            <div className="glass rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-4">CutMix Score Over Time</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b65f0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5b65f0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="scan" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#5b65f0" strokeWidth={2} fill="url(#scoreGradient)" dot={{ fill: '#5b65f0', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Scan history list */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-4">All Scans</h3>
              <div className="space-y-3">
                {[...scans].reverse().map((scan, i) => (
                  <button
                    key={scan.id}
                    onClick={() => navigate(`/app/report/${scan.id}`)}
                    className="w-full flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center text-xs font-black">
                      {scan.cutmix_score}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Scan #{scans.length - i}</div>
                      <div className="text-xs text-white/30">{new Date(scan.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="text-xs text-white/30">→</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
