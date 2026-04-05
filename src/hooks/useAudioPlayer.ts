import { useState, useCallback, useRef, useEffect } from 'react'
import type { Song } from '../types'

export function useAudioPlayer(songs: Song[]) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const simulationRef = useRef<number | null>(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    
    const audio = audioRef.current
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }
    
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [])

  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return
    
    // Stop current playback
    audioRef.current.pause()
    if (simulationRef.current) {
      cancelAnimationFrame(simulationRef.current)
    }
    
    setCurrentSong(song)
    setProgress(0)
    setDuration(song.durationSeconds || 180)
    
    // Try to play actual file
    if (song.fileHandle) {
      try {
        const file = await song.fileHandle.getFile()
        const url = URL.createObjectURL(file)
        audioRef.current.src = url
        await audioRef.current.play()
        setIsPlaying(true)
        return
      } catch (err) {
        console.warn('File playback failed:', err)
      }
    }
    
    // Fallback: simulate playback
    simulatePlayback(song.durationSeconds || 180)
  }, [])

  const simulatePlayback = useCallback((durationSeconds: number) => {
    let startTime = Date.now()
    const durationMs = durationSeconds * 1000
    
    const animate = () => {
      if (!isPlaying) return
      
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / durationMs) * 100
      
      if (newProgress >= 100) {
        setProgress(0)
        setIsPlaying(false)
        return
      }
      
      setProgress(newProgress)
      simulationRef.current = requestAnimationFrame(animate)
    }
    
    setIsPlaying(true)
    simulationRef.current = requestAnimationFrame(animate)
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    if (!currentSong) return
    
    if (isPlaying) {
      // Pause
      if (audioRef.current?.src) {
        audioRef.current.pause()
      }
      if (simulationRef.current) {
        cancelAnimationFrame(simulationRef.current)
      }
      setIsPlaying(false)
    } else {
      // Resume
      if (audioRef.current?.src && audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          simulatePlayback(currentSong.durationSeconds || 180)
        })
      } else {
        simulatePlayback(currentSong.durationSeconds || 180)
      }
      setIsPlaying(true)
    }
  }, [currentSong, isPlaying, simulatePlayback])

  const nextSong = useCallback(() => {
    if (!currentSong || songs.length === 0) return
    
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % songs.length
    playSong(songs[nextIndex])
  }, [currentSong, songs, playSong])

  const prevSong = useCallback(() => {
    if (!currentSong || songs.length === 0) return
    
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    playSong(songs[prevIndex])
  }, [currentSong, songs, playSong])

  const seekTo = useCallback((percent: number) => {
    if (!currentSong) return
    
    const newTime = (percent / 100) * (currentSong.durationSeconds || 180)
    
    if (audioRef.current?.src) {
      audioRef.current.currentTime = newTime
    }
    
    setProgress(percent)
  }, [currentSong])

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    currentSong,
    isPlaying,
    progress,
    duration,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    formatTime
  }
}
