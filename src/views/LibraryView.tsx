import { motion } from 'framer-motion'
import type { Song } from '../types'

interface LibraryViewProps {
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onPlaySong: (id: string) => void
}

export default function LibraryView({ songs, currentSong, isPlaying, onPlaySong }: LibraryViewProps) {
  // Group by artist
  const byArtist = songs.reduce((acc, song) => {
    const artist = song.artist || 'Unknown Artist'
    if (!acc[artist]) acc[artist] = []
    acc[artist].push(song)
    return acc
  }, {} as Record<string, Song[]>)

  const artists = Object.keys(byArtist).sort()

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Library</h1>
        <p className="text-white/50">{songs.length} songs</p>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {artists.slice(0, 12).map((artist, i) => (
          <motion.div
            key={artist}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="text-center cursor-pointer group"
          >
            <div 
              className="aspect-square rounded-xl mb-2 flex items-center justify-center text-4xl font-light transition-transform group-hover:scale-105"
              style={{ background: byArtist[artist][0].artColor }}
            >
              {byArtist[artist][0].artLetter}
            </div>
            <p className="font-medium text-sm truncate">{artist}</p>
            <p className="text-white/40 text-xs">{byArtist[artist].length} songs</p>
          </motion.div>
        ))}
      </div>

      {/* All Songs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Songs</h2>
        <div className="space-y-1">
          {songs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              onClick={() => onPlaySong(song.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                currentSong?.id === song.id && isPlaying
                  ? 'bg-white/[0.09]'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: song.artColor }}
              >
                {song.artLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${currentSong?.id === song.id ? 'text-white' : ''}`}>
                  {song.title}
                </p>
                <p className="text-white/50 text-xs truncate">
                  {song.artist}{song.album && song.album !== 'Unknown Album' && ` — ${song.album}`}
                </p>
              </div>
              <span className="text-white/40 text-xs">{song.duration}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
