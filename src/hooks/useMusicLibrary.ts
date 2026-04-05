import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song } from '../types'
import { extractMetadataFromFile } from '../utils/metadata'

const DB_NAME = 'MusicAppDB'
const DB_VERSION = 1

export function useMusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [likedSongs, setLikedSongs] = useState<string[]>([])
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const dbRef = useRef<IDBDatabase | null>(null)

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          dbRef.current = request.result
          resolve()
        }
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('songs')) {
            db.createObjectStore('songs', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      })
    }

    const loadData = async () => {
      await initDB()
      
      // Load songs
      const tx = dbRef.current!.transaction('songs', 'readonly')
      const store = tx.objectStore('songs')
      const songsRequest = store.getAll()
      
      songsRequest.onsuccess = () => {
        const loadedSongs = songsRequest.result as Song[]
        setSongs(loadedSongs)
        setIsSetupComplete(loadedSongs.length > 0)
      }

      // Load liked songs
      const settingsTx = dbRef.current!.transaction('settings', 'readonly')
      const settingsStore = settingsTx.objectStore('settings')
      const likedRequest = settingsStore.get('likedSongs')
      
      likedRequest.onsuccess = () => {
        if (likedRequest.result) {
          setLikedSongs(likedRequest.result.value)
        }
      }
    }

    loadData()
  }, [])

  const saveSongs = useCallback(async (newSongs: Song[]) => {
    if (!dbRef.current) return
    
    const tx = dbRef.current.transaction('songs', 'readwrite')
    const store = tx.objectStore('songs')
    
    await new Promise<void>((resolve) => {
      store.clear()
      newSongs.forEach(song => store.put(song))
      tx.oncomplete = () => resolve()
    })
    
    setSongs(newSongs)
    setIsSetupComplete(true)
  }, [])

  const addToRecent = useCallback((song: Song) => {
    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.id !== song.id)
      return [song, ...filtered].slice(0, 20)
    })
  }, [])

  const toggleLike = useCallback((songId: string) => {
    setLikedSongs(prev => {
      const newLiked = prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
      
      // Save to IndexedDB
      if (dbRef.current) {
        const tx = dbRef.current.transaction('settings', 'readwrite')
        const store = tx.objectStore('settings')
        store.put({ key: 'likedSongs', value: newLiked })
      }
      
      return newLiked
    })
  }, [])

  const extractMetadata = async (file: File, path: string, fileHandle?: FileSystemFileHandle): Promise<Song> => {
    return await extractMetadataFromFile(file, path, fileHandle)
  }

  const scanFolder = useCallback(async (onProgress?: (current: number, total: number) => void) => {
    if (!window.showDirectoryPicker) {
      alert('Please use Chrome or Edge for file system access')
      return
    }
    
    try {
      const dirHandle = await window.showDirectoryPicker()
      const musicFiles: { entry: FileSystemFileHandle; path: string }[] = []
      const supportedFormats = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.opus']
      
      // Fast recursive directory scanning
      async function scanDirectory(handle: FileSystemDirectoryHandle, path = '') {
        const entries: FileSystemHandle[] = []
        for await (const entry of handle.values()) {
          entries.push(entry)
        }
        
        // Process entries in parallel batches
        const batchSize = 50
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize)
          await Promise.all(batch.map(async (entry) => {
            if (entry.kind === 'directory') {
              await scanDirectory(entry as FileSystemDirectoryHandle, `${path}/${entry.name}`)
            } else if (entry.kind === 'file') {
              const ext = '.' + entry.name.split('.').pop()?.toLowerCase()
              if (supportedFormats.includes(ext)) {
                musicFiles.push({ entry: entry as FileSystemFileHandle, path: `${path}/${entry.name}` })
              }
            }
          }))
        }
      }
      
      await scanDirectory(dirHandle)
      
      // Extract metadata in parallel batches
      const songs: Song[] = []
      const batchSize = 10 // Process 10 files concurrently
      
      for (let i = 0; i < musicFiles.length; i += batchSize) {
        const batch = musicFiles.slice(i, i + batchSize)
        
        const batchResults = await Promise.all(
          batch.map(async ({ entry, path }) => {
            try {
              const file = await entry.getFile()
              // Skip large files for initial metadata read - only read first 256KB for tags
              const tagFile = file.size > 262144 
                ? new File([await file.slice(0, 262144).arrayBuffer()], file.name, { type: file.type })
                : file
              const metadata = await extractMetadata(tagFile, path, entry)
              return metadata
            } catch (e) {
              console.warn('Failed to process:', e)
              return null
            }
          })
        )
        
        songs.push(...batchResults.filter((s): s is Song => s !== null))
        
        // Report progress
        onProgress?.(Math.min(i + batchSize, musicFiles.length), musicFiles.length)
        
        // Yield to main thread to keep UI responsive
        if (i % 50 === 0) {
          await new Promise(r => setTimeout(r, 0))
        }
      }
      
      await saveSongs(songs)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Scan failed:', err)
      }
    }
  }, [saveSongs])

  const resetLibrary = useCallback(async () => {
    if (!dbRef.current) return
    
    const tx = dbRef.current.transaction('songs', 'readwrite')
    const store = tx.objectStore('songs')
    await new Promise<void>((resolve) => {
      store.clear()
      tx.oncomplete = () => resolve()
    })
    
    setSongs([])
    setIsSetupComplete(false)
  }, [])

  return {
    songs,
    recentSongs,
    likedSongs,
    isSetupComplete,
    hasLibrary: songs.length > 0,
    scanFolder,
    addToRecent,
    toggleLike,
    resetLibrary
  }
}
