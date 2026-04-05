import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Song } from '../types'

interface SearchViewProps {
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onPlaySong: (id: string) => void
}

export default function SearchView({ songs, currentSong, isPlaying, onPlaySong }: SearchViewProps) {
  const [query, setQuery] = useState('')
  
  const filtered = query.trim()
    ? songs.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase()) ||
        s.album.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
          autoFocus
        />
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((song) => (
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
      )}

      {!query.trim() && (
        <div className="text-center py-12 text-white/40">
          Type to search your library
        </div>
      )}
    </div>
  )
}
