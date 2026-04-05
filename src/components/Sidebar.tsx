import { motion } from 'framer-motion'
import { Home, Search, Library, Heart, Settings, Disc } from 'lucide-react'
import type { View } from '../App'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  blurIntensity?: string
  glassOpacity?: string
}

const navItems = [
  { id: 'home' as View, label: 'Home', icon: Home },
  { id: 'search' as View, label: 'Search', icon: Search },
  { id: 'library' as View, label: 'Library', icon: Library },
]

const libraryItems = [
  { id: 'liked' as View, label: 'Liked Songs', icon: Heart },
]

export default function Sidebar({ currentView, onViewChange, blurIntensity = '40px', glassOpacity = '0.04' }: SidebarProps) {
  return (
    <aside 
      className="w-[280px] h-full flex flex-col p-4 z-20 border-r border-white/[0.06]"
      style={{ 
        background: `rgba(0,0,0,${glassOpacity})`,
        backdropFilter: `blur(${blurIntensity})`
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8 pt-2">
        <div className="w-10 h-10 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-xl flex items-center justify-center">
          <Disc className="w-5 h-5 text-white/80" />
        </div>
        <span className="text-lg font-bold tracking-tight">Music</span>
      </div>

      {/* Main Nav */}
      <nav className="space-y-1 mb-6">
        <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Menu</p>
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </nav>

      {/* Library Nav */}
      <nav className="space-y-1 flex-1">
        <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Your Library</p>
        {libraryItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </nav>

      {/* Settings */}
      <nav className="space-y-1 pt-4 border-t border-white/[0.06]">
        <NavButton
          item={{ id: 'settings', label: 'Settings', icon: Settings }}
          isActive={currentView === 'settings'}
          onClick={() => onViewChange('settings')}
        />
      </nav>
    </aside>
  )
}

interface NavButtonProps {
  item: { id: View; label: string; icon: React.ElementType }
  isActive: boolean
  onClick: () => void
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
  const Icon = item.icon
  
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white/[0.12] text-white border border-white/[0.08]'
          : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      {item.label}
    </motion.button>
  )
}
