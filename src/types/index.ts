export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  durationSeconds: number
  path: string
  file: string
  fileHandle?: FileSystemFileHandle
  artColor: string
  artLetter: string
  albumArtUrl?: string
  addedAt: number
  trackNumber?: number
  year?: string
  genre?: string
  playCount?: number
  lastPlayed?: number
}
