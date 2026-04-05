// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
  }
  
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>
  }
  
  interface FileSystemFileHandle {
    getFile(): Promise<File>
  }
  
  type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle
}

// CSS module declarations
declare module '*.css' {
  const content: string
  export default content
}

export {}
