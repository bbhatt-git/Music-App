import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Layout, PlayCircle, Image as ImageIcon, Sparkles, Zap, 
  Monitor, Eye, Columns, Sun, Accessibility, Cpu, Terminal, Database,
  RotateCcw, FolderPlus, ChevronLeft, Volume2, Type, Grid3X3, List,
  Keyboard
} from 'lucide-react'
import type { Settings } from '../hooks/useSettings'

type Category = 'appearance' | 'layout' | 'player' | 'library' | 'animations' | 'behavior' | 'accessibility' | 'advanced'

interface SettingsViewProps {
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onReset: () => void
  onImport: () => void
}

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; description: string; count: number }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Glassmorphism, colors, theme', count: 15 },
  { id: 'layout', label: 'Layout', icon: Layout, description: 'Sidebar, player, grid settings', count: 8 },
  { id: 'player', label: 'Player', icon: PlayCircle, description: 'Controls, playback, audio', count: 10 },
  { id: 'library', label: 'Library', icon: ImageIcon, description: 'Album art, metadata, view', count: 12 },
  { id: 'animations', label: 'Animations', icon: Sparkles, description: 'Motion, transitions, effects', count: 6 },
  { id: 'behavior', label: 'Behavior', icon: Zap, description: 'Startup, system, quality', count: 8 },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility, description: 'Vision, motion, input', count: 5 },
  { id: 'advanced', label: 'Advanced', icon: Cpu, description: 'Developer, performance', count: 6 },
]

export default function SettingsView({ settings, onUpdateSetting, onReset, onImport }: SettingsViewProps) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-white/50">Customize your music experience</p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Main Content - Hierarchical Navigation */}
      <AnimatePresence mode="wait">
        {!activeCategory ? (
          /* Level 1: Categories List */
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                    <Icon className="w-6 h-6 text-white/70" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{cat.label}</h3>
                      <span className="text-xs px-2 py-0.5 bg-white/[0.08] rounded-full text-white/50">
                        {cat.count} options
                      </span>
                    </div>
                    <p className="text-sm text-white/40">{cat.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.1]">
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </div>
                </button>
              )
            })}
          </motion.div>
        ) : (
          /* Level 2: Options List for Selected Category */
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Settings</span>
            </button>

            {/* Category Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
              {(() => {
                const cat = CATEGORIES.find(c => c.id === activeCategory)
                const Icon = cat?.icon || Palette
                return (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{cat?.label}</h2>
                      <p className="text-sm text-white/50">{cat?.description}</p>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Settings for this Category */}
            {activeCategory === 'appearance' && <AppearanceSettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'layout' && <LayoutSettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'player' && <PlayerSettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'library' && <LibrarySettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'animations' && <AnimationSettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'behavior' && <BehaviorSettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'accessibility' && <AccessibilitySettings settings={settings} onUpdate={onUpdateSetting} />}
            {activeCategory === 'advanced' && <AdvancedSettings settings={settings} onUpdate={onUpdateSetting} onImport={onImport} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Reset All Settings?</h3>
            <p className="text-white/60 mb-6">Restore all settings to default values.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl font-medium">Cancel</button>
              <button onClick={() => { onReset(); setShowResetConfirm(false); }} className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== SETTING CATEGORY COMPONENTS =====

function AppearanceSettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      {/* Glassmorphism */}
      <SettingGroup title="Glassmorphism" icon={Palette}>
        <SettingItem label="Blur Intensity" description="Strength of the blur effect">
          <SegmentedControl options={['low', 'medium', 'high', 'ultra']} value={settings.blurIntensity} onChange={(v) => onUpdate('blurIntensity', v as any)} />
        </SettingItem>
        <SettingItem label="Panel Opacity" description="Transparency of glass panels">
          <SegmentedControl options={['minimal', 'low', 'medium', 'high']} value={settings.glassOpacity} onChange={(v) => onUpdate('glassOpacity', v as any)} />
        </SettingItem>
        <SettingItem label="Border Opacity" description="Visibility of panel borders">
          <SegmentedControl options={['none', 'subtle', 'normal', 'strong']} value={settings.borderOpacity} onChange={(v) => onUpdate('borderOpacity', v as any)} />
        </SettingItem>
        <SettingItem label="Corner Radius" description="Roundness of corners">
          <SegmentedControl options={['sharp', 'slight', 'rounded', 'pill']} value={settings.borderRadius} onChange={(v) => onUpdate('borderRadius', v as any)} />
        </SettingItem>
      </SettingGroup>

      {/* Colors */}
      <SettingGroup title="Theme Colors" icon={Sun}>
        <SettingItem label="Primary Accent">
          <ColorPicker value={settings.primaryAccent} onChange={(v) => onUpdate('primaryAccent', v)} presets={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']} />
        </SettingItem>
        <SettingItem label="Secondary Accent">
          <ColorPicker value={settings.secondaryAccent} onChange={(v) => onUpdate('secondaryAccent', v)} presets={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']} />
        </SettingItem>
        <SettingItem label="Ambient Background" description="Animated gradient blobs">
          <Toggle value={settings.ambientEnabled} onChange={(v) => onUpdate('ambientEnabled', v)} />
        </SettingItem>
        {settings.ambientEnabled && (
          <>
            <SettingItem label="Ambient Intensity">
              <SegmentedControl options={['low', 'medium', 'high']} value={settings.ambientIntensity} onChange={(v) => onUpdate('ambientIntensity', v as any)} />
            </SettingItem>
            <SettingItem label="Blob 1 Color (RGB)">
              <input type="text" value={settings.ambientColor1} onChange={(e) => onUpdate('ambientColor1', e.target.value)} className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm w-40" placeholder="147, 51, 234" />
            </SettingItem>
          </>
        )}
      </SettingGroup>
    </div>
  )
}

function LayoutSettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Sidebar" icon={Columns}>
        <SettingItem label="Sidebar Width" description="How wide the sidebar is">
          <SegmentedControl options={['narrow', 'normal', 'wide']} value={settings.sidebarWidth} onChange={(v) => onUpdate('sidebarWidth', v as any)} />
        </SettingItem>
        <SettingItem label="Collapsed Mode" description="Start with collapsed sidebar">
          <Toggle value={settings.sidebarCollapsed} onChange={(v) => onUpdate('sidebarCollapsed', v)} />
        </SettingItem>
      </SettingGroup>

      <SettingGroup title="Player Bar" icon={Monitor}>
        <SettingItem label="Position" description="Where player appears">
          <SegmentedControl options={['bottom', 'top', 'floating']} value={settings.playerPosition} onChange={(v) => onUpdate('playerPosition', v as any)} />
        </SettingItem>
        <SettingItem label="Height" description="Size of player bar">
          <SegmentedControl options={['compact', 'normal', 'large']} value={settings.playerHeight} onChange={(v) => onUpdate('playerHeight', v as any)} />
        </SettingItem>
        <SettingItem label="Always Show" description="Keep visible when not playing">
          <Toggle value={settings.showNowPlayingBar} onChange={(v) => onUpdate('showNowPlayingBar', v)} />
        </SettingItem>
      </SettingGroup>

      <SettingGroup title="Content Grid" icon={Grid3X3}>
        <SettingItem label="Layout Density" description="Spacing between elements">
          <SegmentedControl options={['compact', 'comfortable', 'spacious']} value={settings.layoutDensity} onChange={(v) => onUpdate('layoutDensity', v as any)} />
        </SettingItem>
        <SettingItem label="Card Size" description="Size of song cards">
          <SegmentedControl options={['small', 'normal', 'large']} value={settings.cardSize} onChange={(v) => onUpdate('cardSize', v as any)} />
        </SettingItem>
        <SettingItem label="Grid Columns" description="Number of columns">
          <SegmentedControl options={['auto', '2', '3', '4', '5', '6']} value={settings.gridColumns} onChange={(v) => onUpdate('gridColumns', v as any)} />
        </SettingItem>
      </SettingGroup>
    </div>
  )
}

function PlayerSettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Control Visibility" icon={Eye}>
        <SettingItem label="Play/Pause Buttons"><Toggle value={settings.showPlayButtons} onChange={(v) => onUpdate('showPlayButtons', v)} /></SettingItem>
        <SettingItem label="Progress Bar"><Toggle value={settings.showProgressBar} onChange={(v) => onUpdate('showProgressBar', v)} /></SettingItem>
        <SettingItem label="Time Display"><Toggle value={settings.showTimeDisplay} onChange={(v) => onUpdate('showTimeDisplay', v)} /></SettingItem>
        <SettingItem label="Volume Control"><Toggle value={settings.showVolumeControl} onChange={(v) => onUpdate('showVolumeControl', v)} /></SettingItem>
        <SettingItem label="Shuffle & Repeat"><Toggle value={settings.showShuffleRepeat} onChange={(v) => onUpdate('showShuffleRepeat', v)} /></SettingItem>
        <SettingItem label="Like Button"><Toggle value={settings.showLikeButton} onChange={(v) => onUpdate('showLikeButton', v)} /></SettingItem>
        <SettingItem label="Queue Button"><Toggle value={settings.showQueueButton} onChange={(v) => onUpdate('showQueueButton', v)} /></SettingItem>
        <SettingItem label="Lyrics Button"><Toggle value={settings.showLyricsButton} onChange={(v) => onUpdate('showLyricsButton', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="Playback Behavior" icon={PlayCircle}>
        <SettingItem label="Auto Play" description="Start playing when selecting"><Toggle value={settings.autoPlay} onChange={(v) => onUpdate('autoPlay', v)} /></SettingItem>
        <SettingItem label="Fade on Pause"><Toggle value={settings.fadeOnPause} onChange={(v) => onUpdate('fadeOnPause', v)} /></SettingItem>
        <SettingItem label="Gapless Playback"><Toggle value={settings.gaplessPlayback} onChange={(v) => onUpdate('gaplessPlayback', v)} /></SettingItem>
        <SettingItem label="Crossfade Duration">
          <input type="number" min="0" max="12" value={settings.crossfadeDuration} onChange={(e) => onUpdate('crossfadeDuration', parseInt(e.target.value) || 0)} className="w-20 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm" />
        </SettingItem>
        <SettingItem label="Volume Normalization"><Toggle value={settings.volumeNormalization} onChange={(v) => onUpdate('volumeNormalization', v)} /></SettingItem>
      </SettingGroup>
    </div>
  )
}

function LibrarySettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Album Art" icon={ImageIcon}>
        <SettingItem label="Display Mode" description="Which artwork to show">
          <SegmentedControl options={['real', 'generated', 'none']} value={settings.albumArtDisplay} onChange={(v) => onUpdate('albumArtDisplay', v as any)} />
        </SettingItem>
        <SettingItem label="Art Style" description="Shape of artwork">
          <SegmentedControl options={['square', 'rounded', 'circle', 'vinyl']} value={settings.albumArtStyle} onChange={(v) => onUpdate('albumArtStyle', v as any)} />
        </SettingItem>
      </SettingGroup>

      <SettingGroup title="Metadata Display" icon={Type}>
        <SettingItem label="Artist Name"><Toggle value={settings.showArtistName} onChange={(v) => onUpdate('showArtistName', v)} /></SettingItem>
        <SettingItem label="Album Name"><Toggle value={settings.showAlbumName} onChange={(v) => onUpdate('showAlbumName', v)} /></SettingItem>
        <SettingItem label="Track Number"><Toggle value={settings.showTrackNumber} onChange={(v) => onUpdate('showTrackNumber', v)} /></SettingItem>
        <SettingItem label="Duration"><Toggle value={settings.showDuration} onChange={(v) => onUpdate('showDuration', v)} /></SettingItem>
        <SettingItem label="Year"><Toggle value={settings.showYear} onChange={(v) => onUpdate('showYear', v)} /></SettingItem>
        <SettingItem label="Genre"><Toggle value={settings.showGenre} onChange={(v) => onUpdate('showGenre', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="View Options" icon={List}>
        <SettingItem label="Default Sort">
          <SegmentedControl options={['title', 'artist', 'album', 'recent', 'added']} value={settings.defaultSortBy} onChange={(v) => onUpdate('defaultSortBy', v as any)} />
        </SettingItem>
        <SettingItem label="Default View">
          <SegmentedControl options={['grid', 'list', 'compact']} value={settings.defaultView} onChange={(v) => onUpdate('defaultView', v as any)} />
        </SettingItem>
        <SettingItem label="Group By">
          <SegmentedControl options={['none', 'artist', 'album', 'folder']} value={settings.groupBy} onChange={(v) => onUpdate('groupBy', v as any)} />
        </SettingItem>
      </SettingGroup>
    </div>
  )
}

function AnimationSettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="General Animations" icon={Sparkles}>
        <SettingItem label="Enable Animations"><Toggle value={settings.animationsEnabled} onChange={(v) => onUpdate('animationsEnabled', v)} /></SettingItem>
        {settings.animationsEnabled && (
          <>
            <SettingItem label="Animation Speed">
              <SegmentedControl options={['slow', 'normal', 'fast']} value={settings.animationSpeed} onChange={(v) => onUpdate('animationSpeed', v as any)} />
            </SettingItem>
            <SettingItem label="Page Transitions"><Toggle value={settings.pageTransitions} onChange={(v) => onUpdate('pageTransitions', v)} /></SettingItem>
            <SettingItem label="Hover Effects"><Toggle value={settings.hoverEffects} onChange={(v) => onUpdate('hoverEffects', v)} /></SettingItem>
            <SettingItem label="Playing Animation">
              <SegmentedControl options={['vinyl', 'pulse', 'wave', 'none']} value={settings.playingAnimation} onChange={(v) => onUpdate('playingAnimation', v as any)} />
            </SettingItem>
          </>
        )}
      </SettingGroup>
    </div>
  )
}

function BehaviorSettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Startup & Resume" icon={Zap}>
        <SettingItem label="Resume on Startup"><Toggle value={settings.resumeOnStartup} onChange={(v) => onUpdate('resumeOnStartup', v)} /></SettingItem>
        <SettingItem label="Remember Position"><Toggle value={settings.rememberPlaybackPosition} onChange={(v) => onUpdate('rememberPlaybackPosition', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="System Integration" icon={Monitor}>
        <SettingItem label="Minimize to Tray"><Toggle value={settings.minimizeToTray} onChange={(v) => onUpdate('minimizeToTray', v)} /></SettingItem>
        <SettingItem label="Close to Tray"><Toggle value={settings.closeToTray} onChange={(v) => onUpdate('closeToTray', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="Audio Quality" icon={Volume2}>
        <SettingItem label="Quality">
          <SegmentedControl options={['low', 'normal', 'high', 'lossless']} value={settings.audioQuality} onChange={(v) => onUpdate('audioQuality', v as any)} />
        </SettingItem>
      </SettingGroup>
    </div>
  )
}

function AccessibilitySettings({ settings, onUpdate }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Visual" icon={Eye}>
        <SettingItem label="High Contrast"><Toggle value={settings.highContrast} onChange={(v) => onUpdate('highContrast', v)} /></SettingItem>
        <SettingItem label="Reduce Motion"><Toggle value={settings.reduceMotion} onChange={(v) => onUpdate('reduceMotion', v)} /></SettingItem>
        <SettingItem label="Large Text"><Toggle value={settings.largeText} onChange={(v) => onUpdate('largeText', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="Input" icon={Keyboard}>
        <SettingItem label="Keyboard Shortcuts"><Toggle value={settings.keyboardShortcuts} onChange={(v) => onUpdate('keyboardShortcuts', v)} /></SettingItem>
      </SettingGroup>
    </div>
  )
}

function AdvancedSettings({ settings, onUpdate, onImport }: { settings: Settings; onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void; onImport: () => void }) {
  return (
    <div className="space-y-6">
      <SettingGroup title="Developer" icon={Terminal}>
        <SettingItem label="Developer Mode"><Toggle value={settings.developerMode} onChange={(v) => onUpdate('developerMode', v)} /></SettingItem>
        <SettingItem label="Show Debug Info"><Toggle value={settings.showDebugInfo} onChange={(v) => onUpdate('showDebugInfo', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="Performance" icon={Cpu}>
        <SettingItem label="Hardware Acceleration"><Toggle value={settings.hardwareAcceleration} onChange={(v) => onUpdate('hardwareAcceleration', v)} /></SettingItem>
        <SettingItem label="Clear Cache on Exit"><Toggle value={settings.clearCacheOnExit} onChange={(v) => onUpdate('clearCacheOnExit', v)} /></SettingItem>
      </SettingGroup>

      <SettingGroup title="Library" icon={Database}>
        <button onClick={onImport} className="flex items-center gap-2 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08]">
          <FolderPlus className="w-5 h-5" />
          <span>Import Music</span>
        </button>
      </SettingGroup>
    </div>
  )
}

// ===== UI COMPONENTS =====

function SettingGroup({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
        <Icon className="w-4 h-4 text-white/50" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

function SettingItem({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
      {options.map((option) => (
        <button key={option} onClick={() => onChange(option)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${value === option ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-white' : 'bg-white/20'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${value ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

function ColorPicker({ value, onChange, presets }: { value: string; onChange: (value: string) => void; presets: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {presets.map((color) => (
        <button key={color} onClick={() => onChange(color)} className={`w-7 h-7 rounded-lg transition-all ${value === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`} style={{ backgroundColor: color }} />
      ))}
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded-lg overflow-hidden cursor-pointer" />
    </div>
  )
}
