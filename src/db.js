// Database Module
const DB = {
    db: null,
    DB_NAME: 'MusicApp',
    DB_VERSION: 1,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('songs')) {
                    db.createObjectStore('songs', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    },

    async getSongs() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('songs', 'readonly');
            const store = tx.objectStore('songs');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    },

    async saveSongs(songs) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('songs', 'readwrite');
            const store = tx.objectStore('songs');
            
            // Clear existing
            store.clear();
            
            // Add all songs
            songs.forEach(song => store.put(song));
            
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async setSetting(key, value) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('settings', 'readwrite');
            const store = tx.objectStore('settings');
            store.put({ key, value });
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    },

    async getSetting(key) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('settings', 'readonly');
            const store = tx.objectStore('settings');
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => resolve(null);
        });
    }
};
