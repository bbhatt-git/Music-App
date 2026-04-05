// Parse ID3v2 text tags from buffer
function parseID3v2Tags(buffer: any): { title?: string; artist?: string; album?: string; year?: string; genre?: string } {
  const bytes = new Uint8Array(buffer)
  const dataView = new DataView(buffer)
  const tags: { title?: string; artist?: string; album?: string; year?: string; genre?: string } = {}
  
  // Check for ID3v2 header
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return tags
  }
  
  const tagSize = ((bytes[6] & 0x7F) << 21) | 
                  ((bytes[7] & 0x7F) << 14) | 
                  ((bytes[8] & 0x7F) << 7) | 
                  (bytes[9] & 0x7F)
  
  let offset = 10
  const end = Math.min(10 + tagSize, bytes.length)
  
  while (offset < end - 10) {
    const frameId = String.fromCharCode(...bytes.slice(offset, offset + 4))
    const frameSize = dataView.getUint32(offset + 4, false)
    
    if (frameSize === 0 || frameSize > 1000000) break
    
    // Text frames
    if (['TIT2', 'TPE1', 'TALB', 'TYER', 'TCON', 'TDRC'].includes(frameId)) {
      const encoding = bytes[offset + 10]
      let text = ''
      
      try {
        // Handle different encodings
        if (encoding === 0) {
          // ISO-8859-1
          for (let i = offset + 11; i < offset + 10 + frameSize && bytes[i] !== 0; i++) {
            text += String.fromCharCode(bytes[i])
          }
        } else if (encoding === 1 || encoding === 2) {
          // UTF-16 - skip BOM if present
          let start = offset + 11
          if (bytes[start] === 0xFF && bytes[start + 1] === 0xFE) {
            start += 2
          }
          const decoder = new TextDecoder('utf-16le')
          text = decoder.decode(bytes.slice(start, offset + 10 + frameSize)).replace(/\x00/g, '')
        } else if (encoding === 3) {
          // UTF-8
          const decoder = new TextDecoder('utf-8')
          text = decoder.decode(bytes.slice(offset + 11, offset + 10 + frameSize)).replace(/\x00/g, '')
        }
      } catch (e) {
        // Fallback: try to extract printable ASCII
        for (let i = offset + 11; i < offset + 10 + frameSize && i < bytes.length; i++) {
          const byte = bytes[i]
          if (byte >= 32 && byte < 127) {
            text += String.fromCharCode(byte)
          } else if (byte === 0) {
            break
          }
        }
      }
      
      switch (frameId) {
        case 'TIT2': tags.title = text; break
        case 'TPE1': tags.artist = text; break
        case 'TALB': tags.album = text; break
        case 'TYER': 
        case 'TDRC': tags.year = text; break
        case 'TCON': tags.genre = text; break
      }
    }
    
    offset += 10 + frameSize
  }
  
  return tags
}

// Album Art Extraction Helper - improved for all ID3 versions
export async function extractAlbumArt(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      if (!buffer) {
        resolve(undefined)
        return
      }
      
      try {
        const dataView = new DataView(buffer)
        const bytes = new Uint8Array(buffer)
        
        // Check for ID3v2 header
        if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
          const version = bytes[3]
          const tagSize = ((bytes[6] & 0x7F) << 21) | 
                         ((bytes[7] & 0x7F) << 14) | 
                         ((bytes[8] & 0x7F) << 7) | 
                         (bytes[9] & 0x7F)
          
          let offset = 10
          const end = Math.min(10 + tagSize, bytes.length)
          let bestImage: { data: Uint8Array; mimeType: string; type: number } | null = null
          
          while (offset < end - 10) {
            let frameId: string
            let frameSize: number
            
            if (version === 2) {
              // ID3v2.2 - 3 character frame IDs
              frameId = String.fromCharCode(...bytes.slice(offset, offset + 3))
              frameSize = (bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5]
              if (frameId === 'PIC') {
                // PIC frame format: encoding(1) + mime(3) + type(1) + desc + null + data
                let picOffset = offset + 6
                picOffset++ // Skip encoding
                
                // Read MIME type (3 chars for PIC)
                const mimeType = String.fromCharCode(...bytes.slice(picOffset, picOffset + 3))
                picOffset += 3
                
                const picType = bytes[picOffset++]
                
                // Skip description
                while (bytes[picOffset] !== 0) picOffset++
                picOffset++
                
                const imageData = bytes.slice(picOffset, offset + 6 + frameSize)
                const fullMime = mimeType === 'JPG' ? 'image/jpeg' : mimeType === 'PNG' ? 'image/png' : `image/${mimeType.toLowerCase()}`
                
                if (!bestImage || picType === 3 || (picType === 0 && bestImage.type !== 3)) {
                  bestImage = { data: imageData, mimeType: fullMime, type: picType }
                }
              }
              offset += 6 + frameSize
            } else {
              // ID3v2.3/2.4 - 4 character frame IDs
              frameId = String.fromCharCode(...bytes.slice(offset, offset + 4))
              
              if (version === 4) {
                // ID3v2.4 uses syncsafe integers
                frameSize = ((bytes[offset + 4] & 0x7F) << 21) |
                           ((bytes[offset + 5] & 0x7F) << 14) |
                           ((bytes[offset + 6] & 0x7F) << 7) |
                           (bytes[offset + 7] & 0x7F)
              } else {
                // ID3v2.3 uses normal big-endian
                frameSize = dataView.getUint32(offset + 4, false)
              }
              
              if (frameId === 'APIC') {
                let picOffset = offset + 10
                
                // Skip text encoding (1 byte)
                picOffset++
                
                // Read MIME type (null-terminated)
                let mimeType = ''
                while (bytes[picOffset] !== 0 && picOffset < offset + 10 + frameSize) {
                  mimeType += String.fromCharCode(bytes[picOffset])
                  picOffset++
                }
                picOffset++ // Skip null terminator
                
                // Picture type (1 byte) - 3 is cover front
                const picType = bytes[picOffset++]
                
                // Skip description (null-terminated)
                while (bytes[picOffset] !== 0 && picOffset < offset + 10 + frameSize) {
                  picOffset++
                }
                picOffset++ // Skip null terminator
                
                const imageData = bytes.slice(picOffset, offset + 10 + frameSize)
                
                // Prefer cover front (type 3) or other (type 0)
                if (!bestImage || picType === 3 || (picType === 0 && bestImage.type !== 3)) {
                  bestImage = { data: imageData, mimeType: mimeType || 'image/jpeg', type: picType }
                }
              }
              
              offset += 10 + frameSize
            }
            
            if (frameSize === 0 || frameSize > 10000000) break
          }
          
          if (bestImage) {
            // Copy to new buffer to ensure standard ArrayBuffer for Blob compatibility
            const copiedData = new Uint8Array(bestImage.data)
            const blob = new Blob([copiedData], { type: bestImage.mimeType })
            const url = URL.createObjectURL(blob)
            resolve(url)
            return
          }
        }
        
        resolve(undefined)
      } catch (err) {
        console.warn('Failed to extract album art:', err)
        resolve(undefined)
      }
    }
    
    reader.onerror = () => resolve(undefined)
    reader.readAsArrayBuffer(file.slice(0, 1000000)) // Read first 1MB for larger album art
  })
}

// Extract metadata from music file
export async function extractMetadataFromFile(
  file: File, 
  path: string, 
  fileHandle?: FileSystemFileHandle
) {
  const fileName = file.name.replace(/\.[^/.]+$/, '')
  
  // Default values
  let title = fileName
  let artist = 'Unknown Artist'
  let album = 'Unknown Album'
  let trackNumber: number | undefined
  let year: string | undefined
  let genre: string | undefined
  
  // Try to read ID3 tags first
  try {
    const tagBuffer = await file.slice(0, 500000).arrayBuffer() as ArrayBuffer
    const id3Tags = parseID3v2Tags(tagBuffer)
    
    if (id3Tags.title) title = id3Tags.title
    if (id3Tags.artist) artist = id3Tags.artist
    if (id3Tags.album) album = id3Tags.album
    if (id3Tags.year) year = id3Tags.year
    if (id3Tags.genre) genre = id3Tags.genre
  } catch (e) {
    console.warn('ID3 tag reading failed:', e)
  }
  
  // If no ID3 tags, parse from filename
  if (title === fileName && artist === 'Unknown Artist') {
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
  }
  
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
  
  // Generate fallback art - use title's first letter
  const hash = title.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const hue = Math.abs(hash % 360)
  const artColor = `hsl(${hue}, 60%, 40%)`
  const artLetter = title.charAt(0).toUpperCase() || '♪'
  
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
