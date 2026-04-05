import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, Shuffle, Repeat } from 'lucide-react'
import type { Song } from '../types'

interface FullPlayerProps {
  isOpen: boolean
  onClose: () => void
  currentSong: Song | null
  isPlaying: boolean
  progress: number
  duration: number
  isLiked: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (percent: number) => void
  onToggleLike: () => void
}

export default function FullPlayer({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  progress,
  duration,
  isLiked,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onToggleLike
}: FullPlayerProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0d0d0d] border border-white/[0.06] rounded-t-3xl p-6 pb-10"
          >
            {/* Handle */}
            <div className="flex justify-center mb-6">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Artwork */}
            <div className="aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <div 
                className="w-full h-full flex items-center justify-center text-8xl font-light"
                style={{ background: currentSong?.artColor || 'rgba(255,255,255,0.06)' }}
              >
                {currentSong?.artLetter || '♪'}
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1">
                {currentSong?.title || 'Not Playing'}
              </h2>
              <p className="text-white/60">
                {currentSong?.artist || 'Select a song'}
                {currentSong?.album && currentSong.album !== 'Unknown Album' && (
                  <span className="text-white/40"> — {currentSong.album}</span>
                )}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div 
                className="h-1 bg-white/10 rounded-full cursor-pointer mb-2"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = ((e.clientX - rect.left) / rect.width) * 100
                  onSeek(Math.max(0, Math.min(100, percent)))
                }}
              >
                <motion.div 
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-3 text-white/40 hover:text-white transition-colors"
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPrev}
                className="p-3 text-white/60 hover:text-white transition-colors"
              >
                <SkipBack className="w-7 h-7" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onTogglePlay}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                className="p-3 text-white/60 hover:text-white transition-colors"
              >
                <SkipForward className="w-7 h-7" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleLike}
                className={`p-3 transition-colors ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
