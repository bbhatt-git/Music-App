import { motion } from 'framer-motion'
import type { Song } from '../types'

interface LibraryViewProps {
  songs: Song[]
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
    defaultSortBy: string
    defaultView: string
    groupBy: string
  }
}

export default function LibraryView({ songs, currentSong, isPlaying, onPlaySong, isMobile = false, settings }: LibraryViewProps) {
  const albumArtDisplay = settings?.albumArtDisplay ?? 'real'
  const albumArtStyle = settings?.albumArtStyle ?? 'rounded'
  const showAlbum = settings?.showAlbumName ?? true
  const showArtist = settings?.showArtistName ?? true
  const showDuration = settings?.showDuration ?? true
  const layoutDensity = settings?.layoutDensity ?? 'comfortable'
  
  const borderRadius = albumArtStyle === 'circle' ? 'rounded-full' : albumArtStyle === 'square' ? 'rounded-none' : albumArtStyle === 'vinyl' ? 'rounded-full border-2 border-white/10' : 'rounded-lg'
  
  const cardPadding = layoutDensity === 'compact' ? 'p-2' : layoutDensity === 'spacious' ? 'p-4' : 'p-3'
  
  // Render album art helper
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

  // Group by selected criteria
  const grouped = songs.reduce((acc, song) => {
    let key = song.artist || 'Unknown Artist'
    if (!acc[key]) acc[key] = []
    acc[key].push(song)
    return acc
  }, {} as Record<string, Song[]>)

  const groups = Object.keys(grouped).sort()

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Library</h1>
        <p className="text-white/50">{songs.length} songs</p>
      </div>

      {/* Grouped Sections */}
      {groups.map((group) => (
        <section key={group} className="space-y-3">
          <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: grouped[group][0].artColor }} />
            {group}
            <span className="text-sm font-normal text-white/40">({grouped[group].length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {grouped[group].slice(0, isMobile ? 4 : 6).map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onPlaySong(song.id)}
                className={`group cursor-pointer bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl ${cardPadding} hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300`}
              >
                <div className={`aspect-square mb-3 relative overflow-hidden shadow-lg shadow-black/30 ${borderRadius}`}>
                  {renderAlbumArt(song, 'text-3xl')}
                </div>
                <p className="font-semibold text-sm truncate">{song.title}</p>
                {showArtist && <p className="text-white/50 text-xs truncate">{song.artist}</p>}
                {showAlbum && song.album !== 'Unknown Album' && <p className="text-white/30 text-xs truncate">{song.album}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* All Songs List */}
      <section className="pt-6 border-t border-white/[0.06]">
        <h2 className="text-xl font-semibold mb-4">All Songs</h2>
        <div className="space-y-1">
          {songs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              onClick={() => onPlaySong(song.id)}
              className={`flex items-center gap-3 ${cardPadding} rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                currentSong?.id === song.id && isPlaying
                  ? 'bg-white/[0.12] border-white/[0.08]'
                  : 'hover:bg-white/[0.06] hover:border-white/[0.04]'
              }`}
            >
              <div className={`w-11 h-11 flex-shrink-0 shadow-md overflow-hidden ${borderRadius}`}>
                {renderAlbumArt(song, 'text-sm')}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${currentSong?.id === song.id ? 'text-white' : ''}`}>
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
