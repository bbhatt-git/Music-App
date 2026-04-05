// Main Application
const App = {
    songs: [],
    recentSongs: [],
    likedSongs: [],
    currentPage: 'home',
    setupStep: 'welcome',

    async init() {
        await DB.init();
        Player.init();
        
        Player.onPlay = (song) => this.onSongPlay(song);
        Player.onPause = () => this.onSongPause();
        Player.onProgress = (p, c, t) => this.onProgressUpdate(p, c, t);
        Player.onEnded = () => this.onSongEnded();
        
        const savedSongs = await DB.getSongs();
        
        if (savedSongs.length === 0) {
            UI.showSetupStep('welcome');
        } else {
            this.songs = savedSongs;
            this.recentSongs = await DB.getSetting('recentSongs') || [];
            this.likedSongs = await DB.getSetting('likedSongs') || [];
            UI.hideSetup();
            this.navigate('home');
        }
    },

    nextSetupStep() {
        const steps = ['welcome', 'import', 'scanning', 'complete'];
        const idx = steps.indexOf(this.setupStep);
        if (idx < steps.length - 1) {
            this.setupStep = steps[idx + 1];
            UI.showSetupStep(this.setupStep);
        }
    },

    prevSetupStep() {
        const steps = ['welcome', 'import', 'scanning', 'complete'];
        const idx = steps.indexOf(this.setupStep);
        if (idx > 0) {
            this.setupStep = steps[idx - 1];
            UI.showSetupStep(this.setupStep);
        }
    },

    async selectMusicFolder() {
        if (!window.showDirectoryPicker) {
            alert('Your browser does not support file system access. Please use Chrome or Edge.');
            return;
        }

        try {
            const dirHandle = await window.showDirectoryPicker();
            this.nextSetupStep();
            await this.scanFolder(dirHandle);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Folder selection error:', err);
            }
        }
    },

    async scanFolder(dirHandle) {
        const musicFiles = [];
        const supportedFormats = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.opus'];

        UI.updateScanProgress(10, 'Scanning folder...');

        async function scanDirectory(handle, path = '') {
            for await (const entry of handle.values()) {
                if (entry.kind === 'directory') {
                    await scanDirectory(entry, `${path}/${entry.name}`);
                } else if (entry.kind === 'file') {
                    const ext = '.' + entry.name.split('.').pop().toLowerCase();
                    if (supportedFormats.includes(ext)) {
                        musicFiles.push({ entry, path: `${path}/${entry.name}` });
                    }
                }
            }
        }

        await scanDirectory(dirHandle);

        const imported = [];
        for (let i = 0; i < musicFiles.length; i++) {
            try {
                const file = await musicFiles[i].entry.getFile();
                const metadata = await this.extractMetadata(file, musicFiles[i].path, musicFiles[i].entry);
                imported.push(metadata);
                
                const percent = 10 + ((i + 1) / musicFiles.length) * 85;
                UI.updateScanProgress(percent, `Processing ${i + 1} of ${musicFiles.length}`);
            } catch (e) {
                console.warn('Failed to process:', e);
            }
        }

        if (imported.length > 0) {
            await DB.saveSongs(imported);
            this.songs = imported;
            UI.updateScanProgress(100, 'Complete!');
            UI.showComplete(imported.length);
            setTimeout(() => this.nextSetupStep(), 800);
        } else {
            alert('No music files found. Please try another folder.');
            this.prevSetupStep();
        }
    },

    async extractMetadata(file, path, fileHandle) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        
        // Smart parsing of filename
        // Common patterns: "Artist - Title", "Artist - Album - Title", "01. Artist - Title"
        let title = fileName;
        let artist = 'Unknown Artist';
        let album = 'Unknown Album';
        let trackNumber = null;
        
        // Remove track numbers like "01.", "01 -", "01_" at start
        let cleanName = fileName.replace(/^(\d+)[\.\s\-_]+/, (match, num) => {
            trackNumber = parseInt(num);
            return '';
        });
        
        // Split by common separators
        const separators = /[-–—_~|]+/;
        const parts = cleanName.split(separators).map(p => p.trim()).filter(p => p);
        
        if (parts.length >= 2) {
            // Assume format: "Artist - Title" or "Artist - Album - Title"
            artist = parts[0];
            if (parts.length >= 3) {
                album = parts[1];
                title = parts[2];
            } else {
                title = parts[1];
                // Try to extract album from folder path
                const pathParts = path.split('/').filter(p => p);
                if (pathParts.length > 1) {
                    album = pathParts[pathParts.length - 2];
                }
            }
        }
        
        // Clean up common suffixes/prefixes
        title = title.replace(/\s*(\([^)]*\)|\[[^\]]*\])\s*$/, '').trim(); // Remove (feat...) or [remix] at end
        
        let duration = '0:00';
        let durationSeconds = 180;

        // Get actual audio duration
        try {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            audio.src = url;
            
            await new Promise((resolve) => {
                const cleanup = () => {
                    URL.revokeObjectURL(url);
                    resolve();
                };
                
                audio.addEventListener('loadedmetadata', () => {
                    if (audio.duration && !isNaN(audio.duration)) {
                        durationSeconds = audio.duration;
                        const mins = Math.floor(audio.duration / 60);
                        const secs = Math.floor(audio.duration % 60);
                        duration = `${mins}:${secs.toString().padStart(2, '0')}`;
                    }
                    cleanup();
                });
                
                audio.addEventListener('error', cleanup);
                setTimeout(cleanup, 5000);
            });
        } catch (e) {
            console.warn('Duration extraction failed:', e);
        }

        // Generate album art from first letter of artist + color based on artist name
        const artColor = this.generateColorFromString(artist);
        const artLetter = artist.charAt(0).toUpperCase();

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
            addedAt: Date.now()
        };
    },

    generateColorFromString(str) {
        // Generate consistent color from string
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 60%, 40%)`;
    },

    finishSetup() {
        console.log('finishSetup called');
        UI.hideSetup();
        this.navigate('home');
    },

    navigate(page) {
        this.currentPage = page;
        UI.setActiveNav(page);

        switch (page) {
            case 'home':
                UI.renderHome(this.songs, this.recentSongs);
                break;
            case 'library':
                UI.renderLibrary(this.songs);
                break;
            case 'search':
                UI.renderSearch();
                break;
            case 'liked':
                UI.renderLiked(this.songs.filter(s => this.likedSongs.includes(s.id)));
                break;
            case 'settings':
                UI.renderSettings();
                break;
            case 'import':
                UI.renderImport();
                break;
        }
    },

    handleSearch(query) {
        if (!query) {
            UI.renderSearchResults([]);
            return;
        }
        
        const lower = query.toLowerCase();
        const results = this.songs.filter(s => 
            s.title.toLowerCase().includes(lower) ||
            s.artist.toLowerCase().includes(lower)
        );
        
        UI.renderSearchResults(results);
    },

    async playSong(id) {
        const song = this.songs.find(s => s.id === id);
        if (!song) return;

        await Player.loadAndPlay(song);
        
        this.recentSongs = [song, ...this.recentSongs.filter(s => s.id !== id)].slice(0, 20);
        DB.setSetting('recentSongs', this.recentSongs);
        
        if (this.currentPage === 'home') UI.renderHome(this.songs, this.recentSongs);
    },

    togglePlay() {
        Player.toggle();
    },

    nextSong() {
        if (!Player.currentSong) return;
        const idx = this.songs.findIndex(s => s.id === Player.currentSong.id);
        const next = this.songs[idx + 1] || this.songs[0];
        if (next) this.playSong(next.id);
    },

    prevSong() {
        if (!Player.currentSong) return;
        const idx = this.songs.findIndex(s => s.id === Player.currentSong.id);
        const prev = this.songs[idx - 1] || this.songs[this.songs.length - 1];
        if (prev) this.playSong(prev.id);
    },

    seekTrack(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = ((event.clientX - rect.left) / rect.width) * 100;
        Player.seek(Math.max(0, Math.min(100, percent)));
    },

    onSongPlay(song) {
        UI.updateMiniPlayer(song, true);
        UI.updateLargePlayer(song, true);
        UI.updatePlayerLikeState();
        if (this.currentPage === 'home') UI.renderHome(this.songs, this.recentSongs);
        if (this.currentPage === 'library') UI.renderLibrary(this.songs);
    },

    onSongPause() {
        UI.updateMiniPlayer(Player.currentSong, false);
        UI.updateLargePlayer(Player.currentSong, false);
    },

    onProgressUpdate(percent, current, total) {
        UI.updatePlayerProgress(percent);
        UI.updatePlayerTime(current, total);
    },

    onSongEnded() {
        this.nextSong();
    },

    expandPlayer() {
        UI.toggleFullPlayer(true);
        UI.updateLargePlayer(Player.currentSong, Player.isPlaying);
    },

    collapsePlayer() {
        UI.toggleFullPlayer(false);
    },

    toggleLike() {
        if (!Player.currentSong) return;
        
        const id = Player.currentSong.id;
        const idx = this.likedSongs.indexOf(id);
        
        if (idx > -1) {
            this.likedSongs.splice(idx, 1);
        } else {
            this.likedSongs.push(id);
        }
        
        DB.setSetting('likedSongs', this.likedSongs);
        UI.updatePlayerLikeState();
    },

    async resetLibrary() {
        if (!confirm('Remove all music?')) return;
        await DB.saveSongs([]);
        location.reload();
    },

    addMoreMusic() {
        this.navigate('import');
    }
};

// Global handlers
window.startSetup = () => App.nextSetupStep();
window.nextSetupStep = () => App.nextSetupStep();
window.prevSetupStep = () => App.prevSetupStep();
window.selectMusicFolder = () => App.selectMusicFolder();
window.startImport = () => App.selectMusicFolder();
window.finishSetup = () => App.finishSetup();
window.navigateTo = (page) => App.navigate(page);
window.navigate = (page) => App.navigate(page);
window.playSong = (id) => App.playSong(id);
window.togglePlay = () => App.togglePlay();
window.nextSong = () => App.nextSong();
window.prevSong = () => App.prevSong();
window.seekTrack = (e) => App.seekTrack(e);
window.expandPlayer = () => App.expandPlayer();
window.collapsePlayer = () => App.collapsePlayer();
window.toggleLike = () => App.toggleLike();
window.handleSearch = (q) => App.handleSearch(q);
window.resetLibrary = () => App.resetLibrary();
window.addMoreMusic = () => App.addMoreMusic();

document.addEventListener('DOMContentLoaded', () => App.init());
