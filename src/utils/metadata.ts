// Album Art Extraction Helper
export async function extractAlbumArt(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    // Try to read ID3 tags for album art
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      if (!buffer) {
        resolve(undefined)
        return
      }
      
      try {
        // Look for APIC frame in ID3v2
        const dataView = new DataView(buffer)
        const bytes = new Uint8Array(buffer)
        
        // Check for ID3v2 header
        if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
          // Parse ID3v2 tags to find APIC frame
          const tagSize = ((bytes[6] & 0x7F) << 21) | 
                         ((bytes[7] & 0x7F) << 14) | 
                         ((bytes[8] & 0x7F) << 7) | 
                         (bytes[9] & 0x7F)
          
          let offset = 10
          const end = 10 + tagSize
          
          while (offset < end - 10) {
            const frameId = String.fromCharCode(...bytes.slice(offset, offset + 4))
            const frameSize = dataView.getUint32(offset + 4, false)
            
            if (frameId === 'APIC') {
              // Found album art frame
              let picOffset = offset + 10
              
              // Skip text encoding (1 byte)
              picOffset++
              
              // Read MIME type (null-terminated)
              let mimeType = ''
              while (bytes[picOffset] !== 0) {
                mimeType += String.fromCharCode(bytes[picOffset])
                picOffset++
              }
              picOffset++ // Skip null terminator
              
              // Skip picture type (1 byte)
              picOffset++
              
              // Skip description (null-terminated)
              while (bytes[picOffset] !== 0) {
                picOffset++
              }
              picOffset++ // Skip null terminator
              
              // Extract image data
              const imageData = bytes.slice(picOffset, offset + 10 + frameSize)
              const blob = new Blob([imageData], { type: mimeType || 'image/jpeg' })
              const url = URL.createObjectURL(blob)
              resolve(url)
              return
            }
            
            offset += 10 + frameSize
          }
        }
        
        resolve(undefined)
      } catch (err) {
        console.warn('Failed to extract album art:', err)
        resolve(undefined)
      }
    }
    
    reader.onerror = () => resolve(undefined)
    reader.readAsArrayBuffer(file.slice(0, 500000)) // Read first 500KB for tags
  })
}

// Extract metadata from music file
export async function extractMetadataFromFile(
  file: File, 
  path: string, 
  fileHandle?: FileSystemFileHandle
) {
  const fileName = file.name.replace(/\.[^/.]+$/, '')
  
  // Parse filename
  let title = fileName
  let artist = 'Unknown Artist'
  let album = 'Unknown Album'
  let trackNumber: number | undefined
  let year: string | undefined
  let genre: string | undefined
  
  // Remove track numbers from start
  let cleanName = fileName.replace(/^(\d+)[\.\s\-_]+/, (_match, num) => {
    trackNumber = parseInt(num)
    return ''
  })
  
  // Parse Artist - Title format
  const separators = /[-–—_~|]+/
  const parts = cleanName.split(separators).map(p => p.trim()).filter(Boolean)
  
  if (parts.length >= 2) {
    artist = parts[0]
    if (parts.length >= 3) {
      album = parts[1]
      title = parts[2]
    } else {
      title = parts[1]
      const pathParts = path.split('/').filter(Boolean)
      if (pathParts.length > 1) {
        album = pathParts[pathParts.length - 2]
      }
    }
  }
  
  // Clean up title
  title = title.replace(/\s*(\([^)]*\)|\[[^\]]*\])\s*$/, '').trim()
  
  // Get duration
  let duration = '0:00'
  let durationSeconds = 180
  
  try {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.src = url
    
    await new Promise<void>((resolve) => {
      const cleanup = () => {
        URL.revokeObjectURL(url)
        resolve()
      }
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          durationSeconds = audio.duration
          const mins = Math.floor(audio.duration / 60)
          const secs = Math.floor(audio.duration % 60)
          duration = `${mins}:${secs.toString().padStart(2, '0')}`
        }
        cleanup()
      })
      
      audio.addEventListener('error', cleanup)
      setTimeout(cleanup, 5000)
    })
  } catch (e) {
    console.warn('Duration extraction failed:', e)
  }
  
  // Generate fallback art
  const hash = artist.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const hue = Math.abs(hash % 360)
  const artColor = `hsl(${hue}, 60%, 40%)`
  const artLetter = artist.charAt(0).toUpperCase()
  
  // Extract album art
  let albumArtUrl: string | undefined
  try {
    albumArtUrl = await extractAlbumArt(file)
  } catch (e) {
    console.warn('Album art extraction failed:', e)
  }
  
  return {
    id: `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    artist,
    album,
    trackNumber,
    duration,
    durationSeconds,
    path,
    file: file.name,
    fileHandle,
    artColor,
    artLetter,
    albumArtUrl,
    year,
    genre,
    addedAt: Date.now()
  }
}
