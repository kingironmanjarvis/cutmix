import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Trophy, Lock, Star, Zap } from 'lucide-react'

const ACHIEVEMENT_DEFS = [
  { id: 'first_scan', icon: '🎯', title: 'First Scan', desc: 'Complete your first analysis', xp: 100, condition: (scans: any[]) => scans.length >= 1 },
  { id: 'score_60', icon: '⚡', title: 'Solid Ground', desc: 'Reach a score of 60+', xp: 150, condition: (scans: any[]) => scans.some(s => s.cutmix_score >= 60) },
  { id: 'score_70', icon: '🔥', title: 'Attractive Tier', desc: 'Reach a score of 70+', xp: 250, condition: (scans: any[]) => scans.some(s => s.cutmix_score >= 70) },
  { id: 'score_80', icon: '💎', title: 'Sharp Tier', desc: 'Reach a score of 80+', xp: 500, condition: (scans: any[]) => scans.some(s => s.cutmix_score >= 80) },
  { id: 'score_90', icon: '👑', title: 'Elite Tier', desc: 'Reach a score of 90+', xp: 1000, condition: (scans: any[]) => scans.some(s => s.cutmix_score >= 90) },
  { id: 'three_scans', icon: '📸', title: 'Dedicated', desc: 'Complete 3 scans', xp: 200, condition: (scans: any[]) => scans.length >= 3 },
  { id: 'ten_scans', icon: '🏆', title: 'Obsessed', desc: 'Complete 10 scans', xp: 500, condition: (scans: any[]) => scans.length >= 10 },
  { id: 'improvement', icon: '📈', title: 'Glow Up', desc: 'Improve your score by 5+ points', xp: 300, condition: (scans: any[]) => {
    if (scans.length < 2) return false
    const sorted = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return sorted[sorted.length - 1].cutmix_score - sorted[0].cutmix_score >= 5
  }},
]

export default function Achievements() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }
      const { data } = await supabase.from('scans').select('*').eq('user_id', user.id)
      setScans(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const unlocked = ACHIEVEMENT_DEFS.filter(a => a.condition(scans))
  const totalXP = unlocked.reduce((sum, a) => sum + a.xp, 0)
  const level = Math.floor(totalXP / 500) + 1
  const xpToNext = 500 - (totalXP % 500)

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
          <h1 className="text-xl font-black">Achievements</h1>
        </div>

        {/* XP / Level card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Star size={22} className="text-white" />
              </div>
              <div>
                <div className="font-black text-xl">Level {level}</div>
                <div className="text-xs text-white/40">{totalXP} XP total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gold-400">{unlocked.length}/{ACHIEVEMENT_DEFS.length}</div>
              <div className="text-xs text-white/30">unlocked</div>
            </div>
          </div>
          <div className="mb-1.5">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>{totalXP % 500} / 500 XP</span>
              <span>{xpToNext} to Level {level + 1}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(totalXP % 500) / 5}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* Achievements grid */}
        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENT_DEFS.map((ach, i) => {
            const isUnlocked = ach.condition(scans)
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  isUnlocked ? 'glass-strong glow-gold' : 'glass opacity-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  isUnlocked ? 'bg-gold-500/20' : 'bg-white/5'
                }`}>
                  {isUnlocked ? ach.icon : <Lock size={18} className="text-white/20" />}
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${isUnlocked ? '' : 'text-white/30'}`}>{ach.title}</div>
                  <div className="text-xs text-white/35">{ach.desc}</div>
                </div>
                <div className={`text-right flex-shrink-0 ${isUnlocked ? 'text-gold-400' : 'text-white/20'}`}>
                  <div className="text-sm font-bold flex items-center gap-1">
                    <Zap size={12} />
                    {ach.xp}
                  </div>
                  <div className="text-xs">XP</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
