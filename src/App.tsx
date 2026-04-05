import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Menu } from 'lucide-react'
import SetupWizard from './components/SetupWizard'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import PlayerBar from './components/PlayerBar'
import FullPlayer from './components/FullPlayer'
import HomeView from './views/HomeView'
import LibraryView from './views/LibraryView'
import SearchView from './views/SearchView'
import LikedView from './views/LikedView'
import SettingsView from './views/SettingsView'
import { useMusicLibrary } from './hooks/useMusicLibrary'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useSettings, type Settings } from './hooks/useSettings'

export type View = 'home' | 'library' | 'search' | 'liked' | 'settings'

// Helper to convert settings to CSS values
function useSettingsStyles(settings: Settings) {
  const blurIntensity = {
    low: '20px', medium: '40px', high: '60px', ultra: '80px'
  }[settings.blurIntensity]
  
  const glassOpacity = {
    minimal: '0.01', low: '0.03', medium: '0.06', high: '0.12'
  }[settings.glassOpacity]
  
  const borderOpacity = {
    none: '0', subtle: '0.04', normal: '0.08', strong: '0.15'
  }[settings.borderOpacity]
  
  const borderRadius = {
    sharp: '0', slight: '4px', rounded: '12px', pill: '9999px'
  }[settings.borderRadius]
  
  const sidebarWidth = {
    narrow: '220px', normal: '280px', wide: '340px'
  }[settings.sidebarWidth]
  
  return { blurIntensity, glassOpacity, borderOpacity, borderRadius, sidebarWidth }
}

function App() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  
  const { settings, updateSetting, resetSettings } = useSettings()
  const { blurIntensity, glassOpacity } = useSettingsStyles(settings)
  
  const { songs, recentSongs, likedSongs, isSetupComplete, scanFolder, addToRecent, toggleLike, hasLibrary } = useMusicLibrary()
  
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo
  } = useAudioPlayer(songs)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [hasLibrary])

  const handlePlaySong = useCallback((songId: string) => {
    const song = songs.find(s => s.id === songId)
    if (song) {
      playSong(song)
      addToRecent(song)
    }
  }, [songs, playSong, addToRecent])

  const handleFinishSetup = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Build settings object to pass to views
  const viewSettings = {
    albumArtDisplay: settings.albumArtDisplay,
    albumArtStyle: settings.albumArtStyle,
    showAlbumName: settings.showAlbumName,
    showArtistName: settings.showArtistName,
    showDuration: settings.showDuration,
    layoutDensity: settings.layoutDensity,
    cardSize: settings.cardSize,
    gridColumns: settings.gridColumns,
    defaultSortBy: settings.defaultSortBy,
    defaultView: settings.defaultView,
    groupBy: settings.groupBy,
    showTrackNumber: settings.showTrackNumber,
    showYear: settings.showYear,
    showGenre: settings.showGenre,
    animationsEnabled: settings.animationsEnabled,
    animationSpeed: settings.animationSpeed,
    hoverEffects: settings.hoverEffects,
    playingAnimation: settings.playingAnimation,
    // Player settings
    showLikeButton: settings.showLikeButton,
    showProgressBar: settings.showProgressBar,
    showTimeDisplay: settings.showTimeDisplay
  }

  if (isLoading && !hasLibrary) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-white/60" />
          </motion.div>
          <p className="text-white/40 text-sm">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isSetupComplete) {
    return <SetupWizard onScanFolder={scanFolder} onFinish={handleFinishSetup} />
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        background: settings.ambientEnabled ? undefined : settings.backgroundColor,
      }}
    >
      {settings.ambientEnabled && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="ambient-blob w-[700px] h-[700px] bg-purple-600/30 -top-[250px] -right-[150px] animate-float" />
          <div className="ambient-blob w-[600px] h-[600px] bg-blue-600/25 -bottom-[200px] -left-[150px] animate-pulse-glow" />
          <div className="ambient-blob w-[500px] h-[500px] bg-pink-600/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '-5s' }} />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col md:flex-row">
        {!isMobile && (
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        )}

        {isMobile && showMobileSidebar && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowMobileSidebar(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-[280px] z-50">
              <Sidebar currentView={currentView} onViewChange={(v) => { setCurrentView(v); setShowMobileSidebar(false) }} />
            </div>
          </>
        )}

        <main className="flex-1 flex flex-col min-w-0 h-full">
          <header 
            className="flex items-center justify-between px-4 md:px-6 py-4 bg-black/20 border-b border-white/[0.06]"
            style={{
              backdropFilter: `blur(${blurIntensity})`,
              backgroundColor: `rgba(0, 0, 0, ${glassOpacity})`
            }}
          >
            <div className="flex items-center gap-2">
              {isMobile && (
                <button onClick={() => setShowMobileSidebar(true)} className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/80">
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <button className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            <button onClick={() => setCurrentView('search')} className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-32 md:pb-24">
            <AnimatePresence mode="wait">
              <motion.div key={currentView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                {currentView === 'home' && <HomeView songs={songs} recentSongs={recentSongs} currentSong={currentSong} isPlaying={isPlaying} onPlaySong={handlePlaySong} isMobile={isMobile} settings={viewSettings} />}
                {currentView === 'library' && <LibraryView songs={songs} currentSong={currentSong} isPlaying={isPlaying} onPlaySong={handlePlaySong} isMobile={isMobile} settings={viewSettings} />}
                {currentView === 'search' && <SearchView songs={songs} currentSong={currentSong} isPlaying={isPlaying} onPlaySong={handlePlaySong} />}
                {currentView === 'liked' && <LikedView songs={songs.filter(s => likedSongs.includes(s.id))} currentSong={currentSong} isPlaying={isPlaying} onPlaySong={handlePlaySong} />}
                {currentView === 'settings' && <SettingsView settings={settings} onUpdateSetting={updateSetting} onReset={resetSettings} onImport={() => setCurrentView('search')} onRefresh={refreshLibrary} isRefreshing={isScanning} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <div className="fixed bottom-[72px] left-0 right-0 z-[60] md:left-[280px] md:bottom-0">
          <PlayerBar currentSong={currentSong} isPlaying={isPlaying} progress={progress} duration={duration} isLiked={currentSong ? likedSongs.includes(currentSong.id) : false} onTogglePlay={togglePlay} onNext={nextSong} onPrev={prevSong} onSeek={seekTo} onToggleLike={() => currentSong && toggleLike(currentSong.id)} onExpand={() => setShowFullPlayer(true)} isMobile={isMobile} settings={viewSettings} />
        </div>

        {isMobile && <div className="z-50"><MobileNav currentView={currentView} onViewChange={setCurrentView} /></div>}
      </div>

      <FullPlayer isOpen={showFullPlayer} onClose={() => setShowFullPlayer(false)} currentSong={currentSong} isPlaying={isPlaying} progress={progress} duration={duration} isLiked={currentSong ? likedSongs.includes(currentSong.id) : false} onTogglePlay={togglePlay} onNext={nextSong} onPrev={prevSong} onSeek={seekTo} onToggleLike={() => currentSong && toggleLike(currentSong.id)} />
    </div>
  )
}

export default App
