import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, FolderOpen, Loader2, Check } from 'lucide-react'

interface SetupWizardProps {
  onScanFolder: () => Promise<void>
  onFinish: () => void
}

export default function SetupWizard({ onScanFolder, onFinish }: SetupWizardProps) {
  const [step, setStep] = useState<'welcome' | 'import' | 'scanning' | 'complete'>('welcome')
  const [scanProgress, setScanProgress] = useState(0)
  const [songCount, setSongCount] = useState(0)

  const handleStartImport = async () => {
    setStep('scanning')
    setScanProgress(10)
    
    // Simulate progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)
    
    await onScanFolder()
    
    clearInterval(interval)
    setScanProgress(100)
    setStep('complete')
    setSongCount(0) // This would be passed from parent
  }

  const handleFinish = () => {
    onFinish()
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] -top-[200px] -right-[100px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[120px] -bottom-[150px] -left-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-16 text-center max-w-lg"
          >
            {/* Vinyl Animation */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-black border-4 border-zinc-700 shadow-2xl"
              >
                <div className="absolute inset-[35%] rounded-full bg-zinc-900 border-2 border-zinc-700" />
                <div className="absolute inset-[48%] rounded-full bg-black" />
              </motion.div>
              <motion.div
                initial={{ rotate: -30 }}
                animate={{ rotate: -30 }}
                className="absolute top-4 -right-8 w-20 h-1 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full origin-right"
              />
            </div>

            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Your Music
            </h1>
            <p className="text-white/50 mb-8">A refined listening experience</p>
            
            <button
              onClick={() => setStep('import')}
              className="px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-white/10"
            >
              Begin
            </button>
          </motion.div>
        )}

        {step === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-white/[0.06] rounded-2xl border border-white/[0.08] flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-white/60" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Import Library</h2>
            <p className="text-white/50 mb-8">Select your music folder to begin</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartImport}
                className="px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-5 h-5" />
                Select Folder
              </button>
              <button
                onClick={() => setStep('welcome')}
                className="px-8 py-4 bg-transparent text-white/60 rounded-full font-medium hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 text-center max-w-md"
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-white/10 border-t-white/40 rounded-full"
              />
              <Music className="absolute inset-0 m-auto w-8 h-8 text-white/60" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Scanning</h2>
            <p className="text-white/50 mb-6">Analyzing your music collection...</p>
            
            {/* Progress Bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-white/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-white/40 text-sm mt-3">{Math.round(scanProgress)}%</p>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-white/[0.06] rounded-full border border-white/[0.12] flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Ready</h2>
            <p className="text-white/50 mb-8">{songCount || 'Your'} songs are ready to play</p>
            
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <Music className="w-5 h-5" />
              Listen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
