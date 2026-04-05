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

  const scanFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      alert('Please use Chrome or Edge for file system access')
      return
    }
    
    try {
      const dirHandle = await window.showDirectoryPicker()
      const musicFiles: { entry: FileSystemFileHandle; path: string }[] = []
      const supportedFormats = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.opus']
      
      async function scanDirectory(handle: FileSystemDirectoryHandle, path = '') {
        for await (const entry of handle.values()) {
          if (entry.kind === 'directory') {
            await scanDirectory(entry as FileSystemDirectoryHandle, `${path}/${entry.name}`)
          } else if (entry.kind === 'file') {
            const ext = '.' + entry.name.split('.').pop()?.toLowerCase()
            if (supportedFormats.includes(ext)) {
              musicFiles.push({ entry: entry as FileSystemFileHandle, path: `${path}/${entry.name}` })
            }
          }
        }
      }
      
      await scanDirectory(dirHandle)
      
      // Extract metadata
      const songs: Song[] = []
      for (const { entry, path } of musicFiles) {
        try {
          const file = await entry.getFile()
          const metadata = await extractMetadata(file, path, entry)
          songs.push(metadata)
        } catch (e) {
          console.warn('Failed to process:', e)
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
