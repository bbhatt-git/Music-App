import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { Song } from '../types'

interface HomeViewProps {
  songs: Song[]
  recentSongs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onPlaySong: (id: string) => void
  isMobile?: boolean
  settings?: {
    albumArtDisplay: string
    albumArtStyle: string
    showAlbumName: boolean
    showArtistName: boolean
    showDuration: boolean
    layoutDensity: string
    cardSize: string
    gridColumns: string
  }
}

export default function HomeView({ 
  songs, 
  recentSongs, 
  currentSong, 
  isPlaying, 
  onPlaySong,
  isMobile = false,
  settings 
}: HomeViewProps) {
  const recent = recentSongs.slice(0, isMobile ? 4 : 6)
  const allSongs = songs.slice(0, isMobile ? 8 : 12)
  
  // Default settings
  const albumArtDisplay = settings?.albumArtDisplay ?? 'real'
  const albumArtStyle = settings?.albumArtStyle ?? 'rounded'
  const showAlbum = settings?.showAlbumName ?? true
  const showArtist = settings?.showArtistName ?? true
  const showDuration = settings?.showDuration ?? true
  const layoutDensity = settings?.layoutDensity ?? 'comfortable'
  const cardSize = settings?.cardSize ?? 'normal'
  
  const cardPadding = layoutDensity === 'compact' ? 'p-2' : layoutDensity === 'spacious' ? 'p-5' : 'p-3'
  
  // Card size
  const artSize = cardSize === 'small' ? 'text-2xl' : cardSize === 'large' ? 'text-5xl' : 'text-4xl'
  
  // Border radius
  const borderRadius = albumArtStyle === 'circle' ? 'rounded-full' : albumArtStyle === 'square' ? 'rounded-none' : albumArtStyle === 'vinyl' ? 'rounded-full border-4 border-white/10' : 'rounded-lg'

  // Render album art
  const renderAlbumArt = (song: Song, size: string) => {
    if (albumArtDisplay === 'real' && song.albumArtUrl) {
      return (
        <img 
          src={song.albumArtUrl} 
          alt={song.title}
          className={`w-full h-full object-cover ${borderRadius}`}
        />
      )
    }
    return (
      <div 
        className={`w-full h-full flex items-center justify-center ${size} font-light ${borderRadius}`}
        style={{ background: song.artColor }}
      >
        {albumArtDisplay === 'none' ? '' : song.artLetter}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="-mx-6 -mt-4 px-6 py-12 bg-gradient-to-b from-white/[0.06] to-transparent border-b border-white/[0.06]">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent">
          Your Music
        </h1>
        <p className="text-white/50 text-lg">{songs.length} songs in your library</p>
      </div>

      {/* Recently Played */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recent.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onPlaySong(song.id)}
                className="group cursor-pointer bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
              >
                <div 
                  className={`aspect-square mb-3 relative overflow-hidden shadow-lg shadow-black/30 ${borderRadius}`}
                >
                  {renderAlbumArt(song, artSize)}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-sm truncate mb-0.5">{song.title}</p>
                {showArtist && <p className="text-white/50 text-xs truncate">{song.artist}</p>}
                {showAlbum && song.album !== 'Unknown Album' && <p className="text-white/30 text-xs truncate">{song.album}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Songs</h2>
        <div className="space-y-1">
          {allSongs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onPlaySong(song.id)}
              className={`flex items-center gap-3 ${cardPadding} rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                currentSong?.id === song.id && isPlaying
                  ? 'bg-white/[0.12] border-white/[0.08]'
                  : 'hover:bg-white/[0.06] hover:border-white/[0.04]'
              }`}
            >
              <div 
                className={`w-11 h-11 flex-shrink-0 shadow-md overflow-hidden ${borderRadius}`}
              >
                {renderAlbumArt(song, 'text-sm')}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate mb-0.5 ${currentSong?.id === song.id ? 'text-white' : ''}`}>
                  {song.title}
                </p>
                <p className="text-white/50 text-xs truncate">
                  {showArtist && song.artist}
                  {showAlbum && song.album && song.album !== 'Unknown Album' && <span className="text-white/30"> — {song.album}</span>}
                </p>
              </div>
              {showDuration && <span className="text-white/40 text-xs font-medium">{song.duration}</span>}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
