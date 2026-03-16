import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { TrendingUp, AlertTriangle, CheckCircle, Sparkles, Share2, ArrowLeft, Star } from 'lucide-react'

interface Scan {
  id: string
  cutmix_score: number
  symmetry_score: number
  proportion_score: number
  harmony_score: number
  jawline_score: number
  eye_balance_score: number
  report: any
  created_at: string
  tier: string
}

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = size * 0.42
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const color = score >= 85 ? '#f59e0b' : score >= 75 ? '#a78bfa' : score >= 61 ? '#5b65f0' : '#10b981'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.075} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={size * 0.075}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

function MetricBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 80 ? 'from-emerald-500 to-emerald-400' : score >= 60 ? 'from-brand-600 to-brand-400' : 'from-amber-600 to-amber-400'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-white/70">{label}</span>
        <span className="font-bold">{score}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

function getTier(score: number) {
  if (score >= 85) return { name: 'Elite', color: 'text-gold-400', bg: 'bg-gold-500/15 border-gold-500/30' }
  if (score >= 75) return { name: 'Sharp', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' }
  if (score >= 61) return { name: 'Attractive', color: 'text-brand-400', bg: 'bg-brand-500/15 border-brand-500/30' }
  if (score >= 41) return { name: 'Solid', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' }
  return { name: 'Developing', color: 'text-white/50', bg: 'bg-white/5 border-white/10' }
}

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState<Scan | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'features' | 'suggestions'>('overview')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('scans').select('*').eq('id', id).single()
      setScan(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  if (!scan) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40">Report not found.</p>
        <button onClick={() => navigate('/app')} className="mt-4 text-brand-400 text-sm">← Back to dashboard</button>
      </div>
    </div>
  )

  const { report } = scan
  const tier = getTier(scan.cutmix_score)

  return (
    <div className="min-h-screen bg-[#080810] pb-20">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Dashboard</span>
          </button>
          <button className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <Share2 size={16} />
          </button>
        </div>

        {/* Score hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 mb-6 text-center">
          <div className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-bold mb-4 ${tier.bg} ${tier.color}`}>
            <Star size={11} />
            {tier.name} Tier
          </div>

          <div className="relative w-40 h-40 mx-auto mb-4">
            <ScoreRing score={scan.cutmix_score} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl font-black"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {scan.cutmix_score}
              </motion.span>
              <span className="text-xs text-white/40">CutMix Score</span>
            </div>
          </div>

          <p className="text-white/55 text-sm">{report?.tier_description || 'Your facial analysis is complete.'}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {(['overview', 'features', 'suggestions'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                tab === t ? 'bg-brand-600 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Metrics */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider">Score Breakdown</h3>
              <MetricBar label="Symmetry" score={scan.symmetry_score} delay={0.1} />
              <MetricBar label="Proportions" score={scan.proportion_score} delay={0.2} />
              <MetricBar label="Harmony" score={scan.harmony_score} delay={0.3} />
              <MetricBar label="Jawline" score={scan.jawline_score} delay={0.4} />
              <MetricBar label="Eye Balance" score={scan.eye_balance_score} delay={0.5} />
            </div>

            {/* Strengths */}
            {report?.strengths?.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Structural Strengths
                </h3>
                <ul className="space-y-2">
                  {report.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {report?.weaknesses?.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Improvement Areas
                </h3>
                <ul className="space-y-2">
                  {report.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Proportion & Harmony */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-2">Proportion Analysis</h3>
                <p className="text-sm text-white/60 leading-relaxed">{report?.proportion_analysis}</p>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-2">Harmony Evaluation</h3>
                <p className="text-sm text-white/60 leading-relaxed">{report?.harmony_evaluation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {report?.feature_details && Object.entries(report.feature_details).map(([feature, data]: [string, any], i) => (
              <div key={feature} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{feature}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.score}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                      />
                    </div>
                    <span className="text-sm font-bold text-brand-400">{data.score}</span>
                  </div>
                </div>
                <p className="text-sm text-white/45">{data.notes}</p>
              </div>
            ))}
          </motion.div>
        )}

        {tab === 'suggestions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[
              { key: 'grooming', label: '✂️ Grooming', color: 'text-brand-400' },
              { key: 'hairstyle', label: '💇 Hairstyle', color: 'text-purple-400' },
              { key: 'facial_hair', label: '🧔 Facial Hair', color: 'text-amber-400' },
              { key: 'skincare', label: '✨ Skincare', color: 'text-emerald-400' },
              { key: 'posture', label: '🧘 Posture & Angles', color: 'text-pink-400' },
            ].map(({ key, label, color }) => {
              const items = report?.suggestions?.[key]
              if (!items?.length) return null
              return (
                <div key={key} className="glass rounded-2xl p-5">
                  <h3 className={`font-bold text-sm mb-3 ${color}`}>{label}</h3>
                  <ul className="space-y-2">
                    {items.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-white/65 flex items-start gap-2">
                        <span className="text-white/20 font-mono text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            {/* Rescan CTA */}
            <button
              onClick={() => navigate('/app/scan')}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles size={16} />
              Scan Again to Track Progress
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
