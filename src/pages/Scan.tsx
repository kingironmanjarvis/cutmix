import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { analyzeFaceWithGroq } from '../lib/groq'
import { Upload, Camera, X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

type Phase = 'upload' | 'processing' | 'done'

const processingSteps = [
  'Detecting facial landmarks...',
  'Measuring symmetry ratios...',
  'Analyzing proportions...',
  'Calculating harmony scores...',
  'Generating optimization report...',
  'Finalizing CutMix Score...',
]

export default function Scan() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [base64, setBase64] = useState<string>('')
  const [processingStep, setProcessingStep] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      // Extract base64
      const b64 = result.split(',')[1]
      setBase64(b64)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function startAnalysis() {
    if (!base64) return
    setPhase('processing')
    setProcessingStep(0)
    setError('')

    // Animate through steps
    const stepInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 900)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }

      // Run AI analysis
      const metrics = await analyzeFaceWithGroq(base64)

      clearInterval(stepInterval)
      setProcessingStep(processingSteps.length - 1)

      // Upload image to Supabase Storage
      let imageUrl = ''
      try {
        const fileName = `${user.id}/${Date.now()}.jpg`
        const blob = await (await fetch(preview!)).blob()
        const { data: uploadData } = await supabase.storage
          .from('scan-images')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('scan-images').getPublicUrl(fileName)
          imageUrl = urlData.publicUrl
        }
      } catch { /* storage might not be set up yet */ }

      // Save scan to DB
      const { data: scan, error: scanErr } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          cutmix_score: metrics.cutmix_score,
          symmetry_score: metrics.symmetry_score,
          proportion_score: metrics.proportion_score,
          harmony_score: metrics.harmony_score,
          jawline_score: metrics.jawline_score,
          eye_balance_score: metrics.eye_balance_score,
          report: metrics,
          tier: metrics.tier,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (scanErr) throw new Error(scanErr.message)

      setPhase('done')
      await new Promise(r => setTimeout(r, 1200))
      navigate(`/app/report/${scan.id}`)
    } catch (err: any) {
      clearInterval(stepInterval)
      setError(err.message || 'Analysis failed. Please try again.')
      setPhase('upload')
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] pb-20">
      <div className="px-6 pt-12 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/app')} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors">
            ←
          </button>
          <div>
            <h1 className="text-xl font-black">New Scan</h1>
            <p className="text-xs text-white/40">Upload a clear front-facing photo</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Drop zone */}
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer mb-6 overflow-hidden ${
                  dragOver ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20'
                } ${preview ? 'border-solid border-white/10' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !preview && fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full object-cover max-h-80 rounded-2xl" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setBase64('') }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span className="text-xs text-white/80">Photo ready</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-white/30" />
                    </div>
                    <p className="text-white/60 font-medium mb-1">Drop photo here</p>
                    <p className="text-sm text-white/30">or tap to browse · JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {/* Tips */}
              {!preview && (
                <div className="glass rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-white/50 mb-2">📋 Best results tips</p>
                  <ul className="space-y-1">
                    {['Front-facing, eyes forward', 'Good natural lighting', 'No sunglasses or heavy filters', 'Clear background preferred'].map(tip => (
                      <li key={tip} className="text-xs text-white/35 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-400" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm mb-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {preview && (
                <button onClick={startAnalysis} className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 glow-brand">
                  <Sparkles size={18} />
                  Analyze My Face
                </button>
              )}
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              {/* Animated scan visual */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-600/20 to-purple-600/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-2 border-brand-500/40 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-8 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-brand-400 animate-pulse" />
                </div>
                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
                  animate={{ top: ['20%', '80%', '20%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <h2 className="text-xl font-black mb-2">Analyzing...</h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={processingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-white/50 text-sm mb-6"
                >
                  {processingSteps[processingStep]}
                </motion.p>
              </AnimatePresence>

              <div className="flex justify-center gap-1.5">
                {processingSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i <= processingStep ? 'bg-brand-500 w-5' : 'bg-white/10 w-2'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black mb-2">Analysis Complete!</h2>
              <p className="text-white/45 text-sm">Loading your report...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
