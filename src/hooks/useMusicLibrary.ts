import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song } from '../types'
import { extractMetadataFromFile } from '../utils/metadata'

const DB_NAME = 'MusicAppDB'
const DB_VERSION = 1
const SCAN_INTERVAL = 5 * 60 * 1000 // 5 minutes
const LS_KEYS = {
  songs: 'music_app_songs',
  likedSongs: 'music_app_liked',
  folderName: 'music_app_folder_name',
  folderHandleId: 'music_app_folder_handle_id'
}

// Helper to merge songs preserving metadata like play count
function mergeSongs(existing: Song[], fresh: Song[]): Song[] {
  const existingMap = new Map(existing.map((s: Song) => [s.path, s]))
  
  return fresh.map(newSong => {
    const old = existingMap.get(newSong.path)
    if (old) {
      // Preserve user data from old song
      return {
        ...newSong,
        id: old.id, // Keep same ID for likes/recent
        playCount: old.playCount || 0,
        lastPlayed: old.lastPlayed,
        addedAt: old.addedAt // Keep original add date
      }
    }
    return newSong
  })
}

export function useMusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [likedSongs, setLikedSongs] = useState<string[]>([])
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 })
  const dbRef = useRef<IDBDatabase | null>(null)
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      
      // Try IndexedDB first, then fall back to localStorage
      let loadedSongs: Song[] = []
      
      try {
        const tx = dbRef.current!.transaction('songs', 'readonly')
        const store = tx.objectStore('songs')
        const songsRequest = store.getAll()
        
        await new Promise<void>((resolve) => {
          songsRequest.onsuccess = () => {
            loadedSongs = songsRequest.result as Song[]
            resolve()
          }
          songsRequest.onerror = () => resolve()
        })
      } catch (e) {
        console.warn('IndexedDB songs load failed, trying localStorage')
      }
      
      // Fallback to localStorage
      if (loadedSongs.length === 0) {
        const lsSongs = localStorage.getItem(LS_KEYS.songs)
        if (lsSongs) {
          try {
            loadedSongs = JSON.parse(lsSongs)
          } catch (e) {
            console.warn('Failed to parse songs from localStorage')
          }
        }
      }
      
      setSongs(loadedSongs)
      setIsSetupComplete(loadedSongs.length > 0)

      // Load liked songs - try IndexedDB then localStorage
      let loadedLiked: string[] = []
      try {
        const settingsTx = dbRef.current!.transaction('settings', 'readonly')
        const settingsStore = settingsTx.objectStore('settings')
        const likedRequest = settingsStore.get('likedSongs')
        
        await new Promise<void>((resolve) => {
          likedRequest.onsuccess = () => {
            if (likedRequest.result) {
              loadedLiked = likedRequest.result.value
            }
            resolve()
          }
          likedRequest.onerror = () => resolve()
        })
      } catch (e) {
        console.warn('IndexedDB liked songs load failed')
      }
      
      if (loadedLiked.length === 0) {
        const lsLiked = localStorage.getItem(LS_KEYS.likedSongs)
        if (lsLiked) {
          try {
            loadedLiked = JSON.parse(lsLiked)
          } catch (e) {
            console.warn('Failed to parse liked songs from localStorage')
          }
        }
      }
      
      setLikedSongs(loadedLiked)
      
      // Try to restore folder handle - can't store the handle itself,
      // but we can try to use File System Access API's getDirectory if available
      // or just note that user needs to re-select
      const folderName = localStorage.getItem(LS_KEYS.folderName)
      if (folderName) {
        console.log('Previously selected folder:', folderName)
      }
    }

    loadData()
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
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
    
    // Also save to localStorage as backup
    try {
      localStorage.setItem(LS_KEYS.songs, JSON.stringify(newSongs))
    } catch (e) {
      console.warn('Failed to save songs to localStorage')
    }
    
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
      
      // Also save to localStorage as backup
      try {
        localStorage.setItem(LS_KEYS.likedSongs, JSON.stringify(newLiked))
      } catch (e) {
        console.warn('Failed to save liked songs to localStorage')
      }
      
      return newLiked
    })
  }, [])

  const scanFolderInternal = useCallback(async (
    dirHandle: FileSystemDirectoryHandle,
    onProgress?: (current: number, total: number) => void
  ): Promise<Song[]> => {
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
    const newSongs: Song[] = []
    const batchSize = 10
    
    for (let i = 0; i < musicFiles.length; i += batchSize) {
      const batch = musicFiles.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async ({ entry, path }) => {
          try {
            const file = await entry.getFile()
            const tagFile = file.size > 262144 
              ? new File([await file.slice(0, 262144).arrayBuffer()], file.name, { type: file.type })
              : file
            const metadata = await extractMetadataFromFile(tagFile, path, entry)
            return metadata
          } catch (e) {
            console.warn('Failed to process:', e)
            return null
          }
        })
      )
      
      const validSongs = batchResults.filter(s => s !== null) as Song[]
      newSongs.push(...validSongs)
      
      onProgress?.(Math.min(i + batchSize, musicFiles.length), musicFiles.length)
      
      if (i % 50 === 0) {
        await new Promise(r => setTimeout(r, 0))
      }
    }
    
    return newSongs
  }, [extractMetadataFromFile])

  const scanFolder = useCallback(async (onProgress?: (current: number, total: number) => void) => {
    if (!window.showDirectoryPicker) {
      alert('Please use Chrome or Edge for file system access')
      return
    }
    
    setIsScanning(true)
    setScanProgress({ current: 0, total: 0 })
    
    try {
      const dirHandle = await window.showDirectoryPicker()
      dirHandleRef.current = dirHandle
      
      // Store folder name for reference
      localStorage.setItem(LS_KEYS.folderName, dirHandle.name)
      
      const newSongs = await scanFolderInternal(dirHandle, onProgress)
      
      // Merge with existing songs (keep play counts, likes, etc)
      const mergedSongs = mergeSongs(songs, newSongs)
      await saveSongs(mergedSongs)
      
      // Set up periodic scanning
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      
      scanIntervalRef.current = setInterval(async () => {
        try {
          const permission = await (dirHandle as any).requestPermission({ mode: 'read' })
          if (permission === 'granted') {
            const refreshedSongs = await scanFolderInternal(dirHandle)
            const merged = mergeSongs(songs, refreshedSongs)
            await saveSongs(merged)
          }
        } catch (e) {
          console.warn('Background scan failed:', e)
        }
      }, SCAN_INTERVAL)
      
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Scan failed:', err)
      }
    } finally {
      setIsScanning(false)
      setScanProgress({ current: 0, total: 0 })
    }
  }, [saveSongs, scanFolderInternal, songs])

  const refreshLibrary = useCallback(async () => {
    if (!dirHandleRef.current) {
      // No folder selected, do initial scan
      await scanFolder()
      return
    }
    
    setIsScanning(true)
    
    try {
      const permission = await (dirHandleRef.current as any).requestPermission({ mode: 'read' })
      if (permission !== 'granted') {
        alert('Permission denied. Please select the folder again.')
        dirHandleRef.current = null
        setIsScanning(false)
        return
      }
      
      const newSongs = await scanFolderInternal(dirHandleRef.current, (current, total) => {
        setScanProgress({ current, total })
      })
      
      const mergedSongs = mergeSongs(songs, newSongs)
      await saveSongs(mergedSongs)
    } catch (err) {
      console.error('Refresh failed:', err)
      alert('Failed to refresh library. Please try again.')
    } finally {
      setIsScanning(false)
      setScanProgress({ current: 0, total: 0 })
    }
  }, [scanFolder, scanFolderInternal, saveSongs, songs])

  const resetLibrary = useCallback(async () => {
    if (!dbRef.current) return
    
    const tx = dbRef.current.transaction('songs', 'readwrite')
    const store = tx.objectStore('songs')
    await new Promise<void>((resolve) => {
      store.clear()
      tx.oncomplete = () => resolve()
    })
    
    // Clear localStorage
    localStorage.removeItem(LS_KEYS.songs)
    localStorage.removeItem(LS_KEYS.likedSongs)
    localStorage.removeItem(LS_KEYS.folderName)
    
    setSongs([])
    setIsSetupComplete(false)
    dirHandleRef.current = null
  }, [])

  return {
    songs,
    recentSongs,
    likedSongs,
    isSetupComplete,
    hasLibrary: songs.length > 0,
    isScanning,
    scanProgress,
    scanFolder,
    refreshLibrary,
    addToRecent,
    toggleLike,
    resetLibrary
  }
}
