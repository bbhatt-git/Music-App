import { motion } from 'framer-motion'
import { Home, Search, Library, Heart, Settings } from 'lucide-react'
import type { View } from '../App'

interface MobileNavProps {
  currentView: View
  onViewChange: (view: View) => void
}

const mobileItems = [
  { id: 'home' as View, label: 'Home', icon: Home },
  { id: 'search' as View, label: 'Search', icon: Search },
  { id: 'library' as View, label: 'Library', icon: Library },
  { id: 'liked' as View, label: 'Liked', icon: Heart },
  { id: 'settings' as View, label: 'Settings', icon: Settings },
]

export default function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-[40px] border-t border-white/[0.06] px-2 py-2">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-white bg-white/[0.1]'
                  : 'text-white/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
