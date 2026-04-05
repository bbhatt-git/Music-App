import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, Shuffle } from 'lucide-react'
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

  // Get background gradient based on art color or use default
  const bgGradient = currentSong?.artColor
    ? `linear-gradient(180deg, ${currentSong.artColor.replace('hsl', 'hsla').replace(')', ', 0.3)')} 0%, #000 60%)`
    : 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, #000 60%)'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: '#000' }}
        >
          {/* Dynamic Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: bgGradient }}
          />

          {/* Ambient Glow Effect */}
          {currentSong?.artColor && (
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
              style={{ background: currentSong.artColor.replace('40%', '30%') }}
            />
          )}

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-4">
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.12] transition-all active:scale-95"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Now Playing</p>
            </div>
            <div className="w-12" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
            {/* Album Art */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl mb-8"
              style={{
                boxShadow: currentSong?.artColor
                  ? `0 25px 80px -20px ${currentSong.artColor.replace('hsl', 'hsla').replace(')', ', 0.5)')}`
                  : '0 25px 80px -20px rgba(139,92,246,0.5)'
              }}
            >
              {currentSong?.albumArtUrl ? (
                <img
                  src={currentSong.albumArtUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-9xl font-light"
                  style={{ background: currentSong?.artColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {currentSong?.artLetter || '♪'}
                </div>
              )}
            </motion.div>

            {/* Track Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center mb-8 w-full"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white truncate px-4">
                {currentSong?.title || 'Not Playing'}
              </h2>
              <p className="text-white/60 text-base sm:text-lg truncate px-4">
                {currentSong?.artist || 'Select a song'}
                {currentSong?.album && currentSong.album !== 'Unknown Album' && (
                  <span className="text-white/40"> — {currentSong.album}</span>
                )}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full max-w-md mb-8"
            >
              <div
                className="h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
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
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 hover:scale-100 transition-transform" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-2 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center justify-center gap-6"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-3 text-white/40 hover:text-white/80 transition-colors"
              >
                <Shuffle className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPrev}
                className="p-3 text-white/80 hover:text-white transition-colors"
              >
                <SkipBack className="w-8 h-8" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onTogglePlay}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                className="p-3 text-white/80 hover:text-white transition-colors"
              >
                <SkipForward className="w-8 h-8" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleLike}
                className={`p-3 transition-colors ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white/80'}`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
            </motion.div>
          </div>

          {/* Bottom Safe Area */}
          <div className="relative z-10 h-8" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
