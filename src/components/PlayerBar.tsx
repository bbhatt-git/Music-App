import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react'
import type { Song } from '../types'

interface PlayerBarProps {
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
  onExpand: () => void
  isMobile?: boolean
  blurIntensity?: string
  glassOpacity?: string
}

export default function PlayerBar({
  currentSong,
  isPlaying,
  progress,
  duration,
  isLiked,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onToggleLike,
  onExpand,
  isMobile = false,
  blurIntensity = '50px',
  glassOpacity = '0.04'
}: PlayerBarProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <div className={`${isMobile ? 'px-2 pb-20' : 'px-4'} pb-4`}>
      <div 
        className="border border-white/[0.08] rounded-2xl px-4 md:px-5 py-3 shadow-2xl"
        style={{
          background: `rgba(0,0,0,${glassOpacity})`,
          backdropFilter: `blur(${blurIntensity})`
        }}
      >
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={onExpand}
          >
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-semibold transition-all duration-300 group-hover:scale-105 shadow-lg"
              style={{ background: currentSong?.artColor || 'rgba(255,255,255,0.06)' }}
            >
              {currentSong?.artLetter || '♪'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {currentSong?.title || 'Not Playing'}
              </p>
              <p className="text-xs text-white/50 truncate">
                {currentSong?.artist || 'Select a song'}
                {currentSong?.album && currentSong.album !== 'Unknown Album' && (
                  <span className="text-white/30"> — {currentSong.album}</span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onPrev}
              className="p-2.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/[0.08]"
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onTogglePlay}
              className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onNext}
              className="p-2.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/[0.08]"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Progress */}
          <div className={`flex items-center gap-2 ${isMobile ? 'flex-1 max-w-[120px]' : 'flex-1 max-w-md'}`}>
            <span className={`text-[11px] text-white/40 w-9 text-right font-medium ${isMobile ? 'hidden' : ''}`}>
              {formatTime(currentTime)}
            </span>
            <div 
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden hover:bg-white/20 transition-colors"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = ((e.clientX - rect.left) / rect.width) * 100
                onSeek(Math.max(0, Math.min(100, percent)))
              }}
            >
              <motion.div 
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-[11px] text-white/40 w-9 font-medium ${isMobile ? 'hidden' : ''}`}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggleLike}
            className={`p-2.5 rounded-full transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white/40 hover:text-white hover:bg-white/[0.08]'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
