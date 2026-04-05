import { Heart } from 'lucide-react'
import type { Song } from '../types'

interface LikedViewProps {
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onPlaySong: (id: string) => void
}

export default function LikedView({ songs, currentSong, isPlaying, onPlaySong }: LikedViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl">
          <Heart className="w-20 h-20 text-white" />
        </div>
        <div className="pb-4">
          <p className="text-sm font-medium text-white/60 mb-1">Playlist</p>
          <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
          <p className="text-white/50">{songs.length} songs</p>
        </div>
      </div>

      {/* Songs */}
      <div className="space-y-1">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No liked songs yet</p>
            <p className="text-sm mt-2">Click the heart icon on any song to add it here</p>
          </div>
        ) : (
          songs.map((song, i) => (
            <div
              key={song.id}
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
