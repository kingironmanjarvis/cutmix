import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, Star, TrendingUp, Shield, Zap } from 'lucide-react'

const stats = [
  { value: '2.4M+', label: 'Scans Completed' },
  { value: '94%', label: 'Accuracy Rate' },
  { value: '180+', label: 'Countries' },
  { value: '4.9★', label: 'App Rating' },
]

const features = [
  {
    icon: <Zap size={22} className="text-brand-400" />,
    title: 'AI-Powered Analysis',
    desc: 'Real facial landmark detection across 68 key points. No guesswork — pure geometry.',
  },
  {
    icon: <TrendingUp size={22} className="text-purple-400" />,
    title: 'Track Your Progress',
    desc: 'Scan weekly, watch your score climb. Data-driven glow-up with measurable results.',
  },
  {
    icon: <Shield size={22} className="text-emerald-400" />,
    title: 'Private & Secure',
    desc: 'Your face data never leaves your control. End-to-end encryption on every scan.',
  },
  {
    icon: <Star size={22} className="text-gold-400" />,
    title: 'Expert-Level Reports',
    desc: 'Detailed breakdowns of symmetry, proportion, and harmony — like having a top aesthetician on call.',
  },
]

const testimonials = [
  { name: 'Marcus T.', score: 78, text: 'Genuinely shocked at how accurate the breakdown was. It caught my jawline asymmetry that I never noticed.' },
  { name: 'Priya S.', score: 82, text: 'The hairstyle suggestions alone were worth it. Went from a 71 to 82 in 3 months following the guide.' },
  { name: 'Jake R.', score: 85, text: 'This is the most honest feedback I have ever gotten. No sugarcoating, just real improvement advice.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#080810] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CutMix</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign In
          </button>
          <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary text-sm py-2 px-5">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Analysis Engine v3.2 — Now with Llama 4 Vision
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Know Your{' '}
            <span className="gradient-text">True Score.</span>
            <br />
            Unlock Your{' '}
            <span className="gradient-text">Best Face.</span>
          </h1>

          <p className="text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            CutMix delivers professional-grade facial analysis powered by AI. Get your CutMix Score, 
            discover your structural strengths, and follow a personalized optimization roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="btn-primary flex items-center gap-2 text-base py-3.5 px-8 glow-brand"
            >
              Analyze My Face Free
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
            >
              <Star size={14} className="text-gold-400" />
              View sample report
            </button>
          </div>

          {/* Score preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <div className="glass-strong rounded-2xl p-6 max-w-xs w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">Sample Analysis</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Sharp Tier</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="transform -rotate-90 w-20 h-20">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="url(#scoreGrad)" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="213.6"
                      strokeDashoffset="42.7"
                      className="score-ring"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5b65f0" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black">80</span>
                  </div>
                </div>
                <div className="flex-1">
                  {[
                    { label: 'Symmetry', val: 83 },
                    { label: 'Proportion', val: 78 },
                    { label: 'Harmony', val: 81 },
                  ].map(m => (
                    <div key={m.label} className="mb-1.5">
                      <div className="flex justify-between text-xs text-white/50 mb-0.5">
                        <span>{m.label}</span><span>{m.val}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black gradient-text">{s.value}</div>
              <div className="text-sm text-white/40 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Built different.</h2>
            <p className="text-white/45 max-w-xl mx-auto">Not another rating app. CutMix is a full optimization system.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Real results.</h2>
            <p className="text-white/45">Thousands have already leveled up their look.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gold-400 font-bold">Score: {t.score}</div>
                  </div>
                </div>
                <p className="text-white/55 text-sm leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            What's your <span className="gradient-text">CutMix Score?</span>
          </h2>
          <p className="text-white/45 mb-8 text-lg">Find out in 30 seconds. Free scan, no credit card.</p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="btn-primary text-lg py-4 px-10 glow-brand"
          >
            Scan My Face Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/25 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={14} />
          <span className="font-bold">CutMix</span>
        </div>
        <p>© 2026 CutMix. AI-powered looks optimization.</p>
      </footer>
    </div>
  )
}
