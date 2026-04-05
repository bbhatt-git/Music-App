/**
 * SoundWave v3.0 - New Application Logic
 * Handles page navigation, playback, and new modern UI
 */

const newApp = {
    currentPage: 'home',
    isPlaying: false,
    currentTrackIndex: 0,
    shuffle: false,
    repeat: 0,
    progress: 0,
    likedSongs: new Set(),
    songs: [],
    importedFiles: [],
    dirHandle: null,

    // Initialize app
    async init() {
        console.log('Initializing SoundWave v3.0...');
        
        // Load database
        if (typeof DBManager !== 'undefined') {
            try {
                await DBManager.init();
                this.songs = await DBManager.getAllSongs();
                console.log(`Loaded ${this.songs.length} songs from database`);
            } catch (err) {
                console.warn('Database init error:', err);
            }
        }

        // Load config
        this.loadFromStorage();
        this.setupEventListeners();
        this.applyTheme();

        // Check if user has any songs - if not, show setup screen
        if (this.songs.length === 0) {
            console.log('No songs found - showing setup screen');
            this.showSetupScreen();
        } else {
            // User has songs, load normal interface
            this.renderPages();
            this.goToPage('home');
        }
    },

    // Show setup/onboarding screen
    showSetupScreen() {
        // Hide main pages and sidebar
        const sidebar = document.querySelector('.sidebar');
        const pagesContainer = document.querySelector('.pages-container');
        const playerDock = document.querySelector('.player-dock');
        
        if (sidebar) sidebar.style.display = 'none';
        if (pagesContainer) pagesContainer.innerHTML = '';
        if (playerDock) playerDock.style.display = 'none';

        // Create and show setup page
        const setupPage = document.createElement('div');
        setupPage.id = 'setupScreen';
        setupPage.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(29, 185, 84, 0.05) 100%);
            z-index: 1000;
            padding: 40px;
            box-sizing: border-box;
        `;
        
        setupPage.innerHTML = `
            <div style="text-align: center; max-width: 500px;">
                <div style="font-size: 80px; margin-bottom: 30px;">🎵</div>
                <h1 style="color: var(--text-primary); font-size: 2.5rem; margin: 0 0 20px 0;">Welcome to SoundWave</h1>
                <p style="color: var(--text-secondary); font-size: 1.1rem; margin: 0 0 40px 0;">Let's get your music collection ready!</p>
                
                <div style="background: rgba(255,255,255,0.05); border: 2px solid var(--primary); border-radius: 15px; padding: 30px; margin-bottom: 30px; backdrop-filter: blur(20px);">
                    <h2 style="color: var(--primary); margin: 0 0 15px 0; font-size: 1.3rem;">🚀 Quick Start</h2>
                    <p style="color: var(--text-secondary); margin: 0 0 20px 0;">To start listening, you need to import your music files first.</p>
                    <button onclick="newApp.startMusicImport()" style="
                        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                        color: #000;
                        border: none;
                        padding: 15px 40px;
                        font-size: 1rem;
                        font-weight: 600;
                        border-radius: 50px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 8px 24px rgba(29, 185, 84, 0.3);
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        📁 Import Music Files
                    </button>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: left;">
                    <h3 style="color: var(--text-primary); margin: 0 0 15px 0;">📋 How it works:</h3>
                    <ul style="color: var(--text-secondary); margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Click "Import Music Files"</li>
                        <li>Select a folder containing your music</li>
                        <li>The app will scan for MP3, WAV, AAC files</li>
                        <li>Your library will be ready to enjoy!</li>
                    </ul>
                </div>
            </div>
        `;

        document.body.appendChild(setupPage);
    },

    // Hide setup screen and show main app
    hideSetupScreen() {
        const setupScreen = document.getElementById('setupScreen');
        if (setupScreen) setupScreen.remove();
        
        const sidebar = document.querySelector('.sidebar');
        const playerDock = document.querySelector('.player-dock');
        if (sidebar) sidebar.style.display = '';
        if (playerDock) playerDock.style.display = '';
        
        this.renderPages();
        this.goToPage('home');
    },

    // Load from localStorage
    loadFromStorage() {
        const data = localStorage.getItem('soundwave-state');
        if (data) {
            const parsed = JSON.parse(data);
            this.isPlaying = parsed.isPlaying || false;
            this.currentTrackIndex = parsed.currentTrackIndex || 0;
            this.shuffle = parsed.shuffle || false;
            this.repeat = parsed.repeat || 0;
            if (parsed.likedSongs) {
                this.likedSongs = new Set(parsed.likedSongs);
            }
        }
    },

    // Save to localStorage
    saveToStorage() {
        const state = {
            isPlaying: this.isPlaying,
            currentTrackIndex: this.currentTrackIndex,
            shuffle: this.shuffle,
            repeat: this.repeat,
            likedSongs: Array.from(this.likedSongs)
        };
        localStorage.setItem('soundwave-state', JSON.stringify(state));
    },

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) this.goToPage(page);
            });
        });

        // Search
        const searchBtn = document.querySelector('.search-btn');
        const searchBox = document.getElementById('searchBox');
        const searchClose = document.querySelector('.search-close');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchBox.style.display = searchBox.style.display === 'none' ? 'flex' : 'none';
                if (searchBox.style.display === 'flex') {
                    searchInput.focus();
                }
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchBox.style.display = 'none';
            });
        }

        // Player Controls
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => this.handleProgressClick(e));
        }

        document.querySelector('.prev-btn')?.addEventListener('click', () => this.previousTrack());
        document.querySelector('.next-btn')?.addEventListener('click', () => this.nextTrack());
        document.getElementById('shuffleBtn')?.addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeatBtn')?.addEventListener('click', () => this.toggleRepeat());
        document.getElementById('dockLikeBtn')?.addEventListener('click', () => this.toggleLike());

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.cycleTheme());
    },

    // Navigation
    goToPage(pageName) {
        // Prevent navigation if no songs imported (except settings)
        if (this.songs.length === 0 && pageName !== 'settings') {
            alert('Please import music first!');
            return;
        }

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Show/hide pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const page = document.querySelector(`[data-page="${pageName}"]`);
        if (page) {
            page.classList.add('active');
            this.currentPage = pageName;

            // Load page content
            if (pageName === 'home') this.renderHomePage();
            if (pageName === 'library') this.renderLibraryPage();
            if (pageName === 'liked') this.renderLikedPage();
            if (pageName === 'discover') this.renderDiscoverPage();
            if (pageName === 'settings') this.renderSettingsPage();
        }

        this.saveToStorage();
    },

    // Render pages
    renderPages() {
        this.renderHomePage();
        this.renderDiscoverPage();
        this.renderSettingsPage();
    },

    renderHomePage() {
        const container = document.getElementById('recentSongs');
        if (!container) return;

        // Get recent songs from imported music
        const songs = this.songs;
        const recent = songs.slice(0, 10);

        container.innerHTML = recent.map(song => `
            <div class="song-item" onclick="newApp.playSong(${songs.indexOf(song)})">
                <div class="song-item-thumbnail">
                    <img src="${song.image || 'https://via.placeholder.com/50'}" alt="">
                </div>
                <div class="song-item-info">
                    <div class="song-item-title">${song.title}</div>
                    <div class="song-item-artist">${song.artist}</div>
                </div>
                <div class="song-item-duration">${song.duration}</div>
            </div>
        `).join('');
    },

    renderLibraryPage() {
        const container = document.getElementById('librarySongs');
        if (!container) return;

        const songs = this.songs;

        container.innerHTML = songs.map((song, idx) => `
            <div class="song-item" onclick="newApp.playSong(${idx})">
                <div class="song-item-thumbnail">
                    <img src="${song.image || 'https://via.placeholder.com/50'}" alt="">
                </div>
                <div class="song-item-info">
                    <div class="song-item-title">${song.title}</div>
                    <div class="song-item-artist">${song.artist}</div>
                </div>
                <div class="song-item-duration">${song.duration}</div>
            </div>
        `).join('');
    },

    renderLikedPage() {
        const container = document.getElementById('likedSongs');
        const countEl = document.getElementById('likedCount');
        
        if (!container) return;

        const songs = this.songs;
        const liked = songs.filter(song => this.likedSongs.has(song.id));

        if (countEl) countEl.textContent = liked.length;

        container.innerHTML = liked.length > 0 ? liked.map((song, idx) => `
            <div class="song-item" onclick="newApp.playSong(${songs.indexOf(song)})">
                <div class="song-item-thumbnail">
                    <img src="${song.image || 'https://via.placeholder.com/50'}" alt="">
                </div>
                <div class="song-item-info">
                    <div class="song-item-title">${song.title}</div>
                    <div class="song-item-artist">${song.artist}</div>
                </div>
                <div class="song-item-duration">${song.duration}</div>
            </div>
        `).join('') : '<p style="color: var(--text-muted); padding: 20px;">No liked songs yet</p>';
    },

    renderDiscoverPage() {
        const container = document.getElementById('categoryGrid');
        if (!container) return;

        const categories = CONFIG.categories || [];

        container.innerHTML = categories.map(cat => `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" alt="">
                </div>
                <div class="featured-info">
                    <h4>${cat.emoji} ${cat.name}</h4>
                    <p>Browse category</p>
                </div>
            </div>
        `).join('');
    },

    renderSettingsPage() {
        // Render theme options
        const themeOptions = document.getElementById('themeOptions');
        if (themeOptions) {
            const themes = Object.keys(CONFIG.colors || {});
            themeOptions.innerHTML = themes.map(theme => `
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; border-radius: 8px; transition: all 0.2s;">
                    <input type="radio" name="theme" value="${theme}" ${CONFIG.theme === theme ? 'checked' : ''} 
                           onchange="newApp.setTheme('${theme}')">
                    <span>${theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                </label>
            `).join('');
        }

        // Render feature toggles
        const featureToggles = document.getElementById('featureToggles');
        if (featureToggles && CONFIG.features) {
            featureToggles.innerHTML = Object.entries(CONFIG.features).map(([key, value]) => `
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer;">
                    <input type="checkbox" ${value ? 'checked' : ''} onchange="CONFIG.features.${key} = this.checked; CONFIG.save();">
                    <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </label>
            `).join('');
        }
    },

    // Playback
    playSong(index) {
        const songs = this.songs;
        const song = songs[index];
        
        this.currentTrackIndex = index;
        this.updatePlayerDisplay(song);
        this.togglePlay();
    },

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (this.isPlaying) {
                icon.classList.replace('fa-play', 'fa-pause');
                playBtn.classList.add('playing');
                this.simulateProgress();
            } else {
                icon.classList.replace('fa-pause', 'fa-play');
                playBtn.classList.remove('playing');
            }
        }
        this.saveToStorage();
    },

    nextTrack() {
        const songs = this.songs;
        if (this.shuffle) {
            this.currentTrackIndex = Math.floor(Math.random() * songs.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % songs.length;
        }
        const song = songs[this.currentTrackIndex];
        this.updatePlayerDisplay(song);
        this.saveToStorage();
    },

    previousTrack() {
        const songs = this.songs;
        this.currentTrackIndex = (this.currentTrackIndex - 1 + songs.length) % songs.length;
        const song = songs[this.currentTrackIndex];
        this.updatePlayerDisplay(song);
        this.saveToStorage();
    },

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        const btn = document.getElementById('shuffleBtn');
        if (btn) btn.style.color = this.shuffle ? 'var(--primary)' : 'var(--text-secondary)';
        this.saveToStorage();
    },

    toggleRepeat() {
        this.repeat = (this.repeat + 1) % 3;
        const btn = document.getElementById('repeatBtn');
        if (btn) {
            btn.style.color = this.repeat > 0 ? 'var(--primary)' : 'var(--text-secondary)';
            if (this.repeat === 2) {
                btn.innerHTML = '<span style="font-size: 10px; position: absolute; right: 0;">1</span>';
            } else {
                btn.innerHTML = '<i class="fas fa-redo"></i>';
            }
        }
        this.saveToStorage();
    },

    toggleLike() {
        const songs = this.songs;
        const song = songs[this.currentTrackIndex];
        if (!song) return;

        const id = song.id || `${song.artist}__${song.title}`;
        if (this.likedSongs.has(id)) {
            this.likedSongs.delete(id);
        } else {
            this.likedSongs.add(id);
        }

        const btn = document.getElementById('dockLikeBtn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (this.likedSongs.has(id)) {
                icon.classList.replace('far', 'fas');
                icon.style.color = 'var(--primary)';
            } else {
                icon.classList.replace('fas', 'far');
                icon.style.color = 'var(--text-secondary)';
            }
        }

        this.saveToStorage();
    },

    updatePlayerDisplay(song) {
        if (!song) return;

        document.getElementById('dockTitle').textContent = song.title;
        document.getElementById('dockArtist').textContent = song.artist;
        document.getElementById('dockAlbumArt').src = song.image || 'https://via.placeholder.com/56';
        document.getElementById('totalTime').textContent = song.duration;
    },

    simulateProgress() {
        if (!this.isPlaying) return;

        this.progress += 0.5;
        if (this.progress >= 100) {
            this.nextTrack();
            this.progress = 0;
        }

        const fill = document.getElementById('progressFill');
        if (fill) fill.style.width = this.progress + '%';

        if (this.isPlaying) {
            setTimeout(() => this.simulateProgress(), 1000);
        }
    },

    handleProgressClick(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.progress = percent * 100;

        const fill = document.getElementById('progressFill');
        if (fill) fill.style.width = this.progress + '%';
    },

    // Music Import
    async startMusicImport() {
        try {
            const dirHandle = await MusicScanner.selectMusicFolder();
            if (!dirHandle) return;

            this.dirHandle = dirHandle;

            const progressEl = document.getElementById('importProgress');
            if (progressEl) progressEl.style.display = 'block';

            const files = await MusicScanner.scanDirectory(dirHandle);

            this.importedFiles = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const metadata = await MusicScanner.extractMetadata(file);
                this.importedFiles.push(metadata);

                const percent = ((i + 1) / files.length) * 100;
                const fill = document.getElementById('importProgressFill');
                if (fill) fill.style.width = percent + '%';

                const status = document.getElementById('importStatus');
                if (status) status.textContent = `Found ${this.importedFiles.length} songs...`;
            }

            if (this.importedFiles.length > 0) {
                // Save to database
                const songsToSave = this.importedFiles.map((song, idx) => ({
                    ...song,
                    id: `imported_${Date.now()}_${idx}`
                }));

                await DBManager.saveSongs(songsToSave);
                this.songs = await DBManager.getAllSongs();

                alert(`✅ Successfully imported ${this.importedFiles.length} songs!`);
                
                // Hide setup screen and show main app
                this.hideSetupScreen();
            } else {
                alert('No music files found.');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error: ' + error.message);
        }
    },

    // Theme
    cycleTheme() {
        if (!CONFIG.colors) return;

        const themes = Object.keys(CONFIG.colors);
        const currentIndex = themes.indexOf(CONFIG.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        this.setTheme(nextTheme);
    },

    setTheme(themeName) {
        CONFIG.setTheme(themeName);
        this.applyTheme();
    },

    applyTheme() {
        if (!CONFIG.colors || !CONFIG.colors[CONFIG.theme]) return;

        const colors = CONFIG.colors[CONFIG.theme];

        document.documentElement.style.setProperty('--primary', colors.primary);
        document.documentElement.style.setProperty('--primary-dark', colors.primaryDark);
        document.documentElement.style.setProperty('--primary-light', colors.secondary);

        // Update active nav color
        document.querySelectorAll('.nav-item.active').forEach(item => {
            item.style.borderLeftColor = colors.primary;
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    newApp.init();
});

// Expose to global scope for onclick handlers
window.newApp = newApp;
window.app = newApp; // Backward compatibility
