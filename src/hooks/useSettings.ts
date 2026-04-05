import { useState, useEffect, useCallback } from 'react'

export interface Settings {
  // Appearance - Glassmorphism
  blurIntensity: 'low' | 'medium' | 'high' | 'ultra'
  glassOpacity: 'minimal' | 'low' | 'medium' | 'high'
  borderOpacity: 'none' | 'subtle' | 'normal' | 'strong'
  borderRadius: 'sharp' | 'slight' | 'rounded' | 'pill'
  
  // Appearance - Colors & Theme
  themeMode: 'dark' | 'darker' | 'black' | 'custom'
  primaryAccent: string
  secondaryAccent: string
  backgroundColor: string
  textColor: string
  ambientEnabled: boolean
  ambientIntensity: 'low' | 'medium' | 'high'
  ambientColor1: string
  ambientColor2: string
  ambientColor3: string
  
  // Layout
  sidebarWidth: 'narrow' | 'normal' | 'wide'
  sidebarCollapsed: boolean
  playerPosition: 'bottom' | 'top' | 'floating'
  playerHeight: 'compact' | 'normal' | 'large'
  layoutDensity: 'compact' | 'comfortable' | 'spacious'
  cardSize: 'small' | 'normal' | 'large'
  gridColumns: 'auto' | '2' | '3' | '4' | '5' | '6'
  showNowPlayingBar: boolean
  
  // Player Controls
  showPlayButtons: boolean
  showProgressBar: boolean
  showTimeDisplay: boolean
  showVolumeControl: boolean
  showShuffleRepeat: boolean
  showLikeButton: boolean
  showQueueButton: boolean
  showLyricsButton: boolean
  autoPlay: boolean
  fadeOnPause: boolean
  
  // Library & Display
  albumArtDisplay: 'real' | 'generated' | 'none'
  albumArtStyle: 'square' | 'rounded' | 'circle' | 'vinyl'
  showAlbumName: boolean
  showArtistName: boolean
  showTrackNumber: boolean
  showDuration: boolean
  showYear: boolean
  showGenre: boolean
  defaultSortBy: 'title' | 'artist' | 'album' | 'recent' | 'added'
  defaultView: 'grid' | 'list' | 'compact'
  groupBy: 'none' | 'artist' | 'album' | 'folder'
  
  // Animations
  animationsEnabled: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  pageTransitions: boolean
  hoverEffects: boolean
  playingAnimation: 'vinyl' | 'pulse' | 'wave' | 'none'
  
  // Behavior
  minimizeToTray: boolean
  closeToTray: boolean
  resumeOnStartup: boolean
  rememberPlaybackPosition: boolean
  gaplessPlayback: boolean
  crossfadeDuration: number
  volumeNormalization: boolean
  
  // Accessibility
  highContrast: boolean
  reduceMotion: boolean
  largeText: boolean
  keyboardShortcuts: boolean
  
  // Advanced
  developerMode: boolean
  showDebugInfo: boolean
  clearCacheOnExit: boolean
  hardwareAcceleration: boolean
  audioQuality: 'low' | 'normal' | 'high' | 'lossless'
}

export const DEFAULT_SETTINGS: Settings = {
  blurIntensity: 'high',
  glassOpacity: 'medium',
  borderOpacity: 'subtle',
  borderRadius: 'rounded',
  themeMode: 'dark',
  primaryAccent: '#8b5cf6',
  secondaryAccent: '#3b82f6',
  backgroundColor: '#000000',
  textColor: '#ffffff',
  ambientEnabled: true,
  ambientIntensity: 'medium',
  ambientColor1: '147, 51, 234',
  ambientColor2: '59, 130, 246',
  ambientColor3: '236, 72, 153',
  sidebarWidth: 'normal',
  sidebarCollapsed: false,
  playerPosition: 'bottom',
  playerHeight: 'normal',
  layoutDensity: 'comfortable',
  cardSize: 'normal',
  gridColumns: 'auto',
  showNowPlayingBar: true,
  showPlayButtons: true,
  showProgressBar: true,
  showTimeDisplay: true,
  showVolumeControl: true,
  showShuffleRepeat: true,
  showLikeButton: true,
  showQueueButton: false,
  showLyricsButton: false,
  autoPlay: true,
  fadeOnPause: true,
  albumArtDisplay: 'real',
  albumArtStyle: 'rounded',
  showAlbumName: true,
  showArtistName: true,
  showTrackNumber: false,
  showDuration: true,
  showYear: false,
  showGenre: false,
  defaultSortBy: 'recent',
  defaultView: 'grid',
  groupBy: 'none',
  animationsEnabled: true,
  animationSpeed: 'normal',
  pageTransitions: true,
  hoverEffects: true,
  playingAnimation: 'vinyl',
  minimizeToTray: false,
  closeToTray: false,
  resumeOnStartup: true,
  rememberPlaybackPosition: true,
  gaplessPlayback: false,
  crossfadeDuration: 0,
  volumeNormalization: false,
  highContrast: false,
  reduceMotion: false,
  largeText: false,
  keyboardShortcuts: true,
  developerMode: false,
  showDebugInfo: false,
  clearCacheOnExit: false,
  hardwareAcceleration: true,
  audioQuality: 'high'
}

const STORAGE_KEY = 'music-app-settings-v2'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateMultiple = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSetting,
    updateMultiple,
    resetSettings,
    isLoaded
  }
}
