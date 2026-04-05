// Audio Player Module
const Player = {
    audio: new Audio(),
    currentSong: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    interval: null,
    
    // Callbacks for UI updates
    onPlay: null,
    onPause: null,
    onProgress: null,
    onEnded: null,

    init() {
        // Audio event listeners
        this.audio.addEventListener('timeupdate', () => {
            this.progress = this.audio.currentTime / this.audio.duration * 100 || 0;
            if (this.onProgress) this.onProgress(this.progress, this.audio.currentTime, this.audio.duration);
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            if (this.onEnded) this.onEnded();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.warn('Audio error:', e);
            // Fallback to simulation
            this.simulatePlayback();
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration || 180;
        });
    },

    async loadAndPlay(song) {
        this.currentSong = song;
        this.progress = 0;
        
        // Stop any existing playback
        this.stop();
        
        // Try to load actual file
        if (song.fileHandle) {
            try {
                const file = await song.fileHandle.getFile();
                const url = URL.createObjectURL(file);
                this.audio.src = url;
                this.audio.load();
                await this.audio.play();
                this.isPlaying = true;
                if (this.onPlay) this.onPlay(song);
                return;
            } catch (err) {
                console.warn('File playback failed, using simulation:', err);
            }
        }
        
        // Fallback to simulation
        this.simulatePlayback();
    },

    simulatePlayback() {
        // Simulate when no real file
        this.duration = this.currentSong?.durationSeconds || 180;
        this.isPlaying = true;
        
        if (this.interval) clearInterval(this.interval);
        
        this.interval = setInterval(() => {
            if (this.isPlaying) {
                this.progress += (0.5 / this.duration) * 100;
                if (this.progress >= 100) {
                    this.progress = 0;
                    this.isPlaying = false;
                    clearInterval(this.interval);
                    if (this.onEnded) this.onEnded();
                } else if (this.onProgress) {
                    const currentTime = (this.progress / 100) * this.duration;
                    this.onProgress(this.progress, currentTime, this.duration);
                }
            }
        }, 500);
        
        if (this.onPlay) this.onPlay(this.currentSong);
    },

    toggle() {
        if (!this.currentSong) return;
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    },

    pause() {
        if (this.audio.src) {
            this.audio.pause();
        }
        this.isPlaying = false;
        if (this.onPause) this.onPause();
    },

    resume() {
        if (this.audio.src && this.audio.paused) {
            this.audio.play().catch(() => this.simulatePlayback());
        } else if (!this.audio.src) {
            this.simulatePlayback();
        }
        this.isPlaying = true;
        if (this.onPlay) this.onPlay(this.currentSong);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.audio.src) {
            this.audio.pause();
            this.audio.src = '';
        }
        this.isPlaying = false;
        this.progress = 0;
    },

    seek(percent) {
        this.progress = percent;
        
        if (this.audio.src && this.audio.duration) {
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        }
    },

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};
