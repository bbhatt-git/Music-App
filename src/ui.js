// UI Rendering Module
const UI = {
    showSetupStep(step) {
        document.querySelectorAll('.setup-step').forEach(s => s.classList.add('hidden'));
        const target = document.querySelector(`.setup-step[data-step="${step}"]`);
        if (target) target.classList.remove('hidden');
    },

    updateScanProgress(percent, text) {
        const bar = document.getElementById('scanProgress');
        const status = document.getElementById('scanStatus');
        if (bar) bar.style.width = percent + '%';
        if (status && text) status.textContent = text;
    },

    showComplete(count) {
        const text = document.getElementById('completeText');
        if (text) text.textContent = `${count} songs ready to play`;
    },

    hideSetup() {
        const wizard = document.getElementById('setupWizard');
        const app = document.getElementById('appWrapper');
        
        if (!wizard || !app) {
            setTimeout(() => this.hideSetup(), 100);
            return;
        }
        
        wizard.style.display = 'none';
        app.style.display = 'grid';
        app.classList.remove('hidden');
    },

    setActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
    },

    updateMiniPlayer(song, isPlaying) {
        const title = document.getElementById('miniTitle');
        const artist = document.getElementById('miniArtist');
        const artwork = document.getElementById('miniArtwork');
        const btn = document.getElementById('playBtn');
        
        if (title) title.textContent = song?.title || 'Not Playing';
        if (artist) artist.textContent = song?.artist || 'Select a song';
        if (btn) btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        if (artwork && song) {
            artwork.style.background = song.artColor || 'var(--glass-2)';
            artwork.innerHTML = `<span style="font-size: 20px; font-weight: 600;">${song.artLetter || '♪'}</span>`;
        }
    },

    updatePlayerProgress(percent) {
        const bar = document.getElementById('mainProgress');
        const scrubber = document.getElementById('scrubberProgress');
        
        if (bar) bar.style.width = percent + '%';
        if (scrubber) scrubber.style.width = percent + '%';
    },

    updatePlayerTime(current, total) {
        const curr = document.getElementById('currentTime');
        const tot = document.getElementById('totalTime');
        
        if (curr) curr.textContent = Player.formatTime(current);
        if (tot) tot.textContent = Player.formatTime(total);
    },

    updateLargePlayer(song, isPlaying) {
        const title = document.getElementById('largeTitle');
        const artist = document.getElementById('largeArtist');
        const artwork = document.getElementById('largeArtwork');
        const btn = document.getElementById('largePlayBtn');
        
        if (title) title.textContent = song?.title || 'Title';
        if (artist) artist.textContent = song?.artist || 'Artist';
        if (btn) btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        if (artwork && song) {
            const disk = artwork.querySelector('.artwork-disk');
            if (disk) {
                disk.style.background = song.artColor || 'var(--glass-2)';
                disk.innerHTML = `<span style="font-size: 80px; font-weight: 300;">${song.artLetter || '♪'}</span>`;
            }
        }
    },

    toggleFullPlayer(show) {
        const player = document.getElementById('fullPlayer');
        if (player) player.classList.toggle('active', show);
    },

    updatePlayerLikeState() {
        const btn = document.getElementById('likeBtn');
        if (!btn || !Player.currentSong) return;
        
        const isLiked = App.likedSongs.includes(Player.currentSong.id);
        btn.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
        btn.style.color = isLiked ? '#ef4444' : '';
    },

    renderHome(songs, recentSongs) {
        const content = document.getElementById('mainContent');
        if (!content) return;

        const recent = recentSongs.slice(0, 6);
        const all = songs.slice(0, 12);

        content.innerHTML = `
            <div class="page">
                <div class="hero-section">
                    <h1 class="hero-title">Your Music</h1>
                    <p class="hero-subtitle">${songs.length} songs in your library</p>
                </div>
                
                ${recent.length > 0 ? `
                <section class="section">
                    <h2 class="section-heading">Recently Played</h2>
                    <div class="cards-grid">
                        ${recent.map(song => this.renderCard(song)).join('')}
                    </div>
                </section>
                ` : ''}
                
                <section class="section">
                    <h2 class="section-heading">All Songs</h2>
                    <div class="song-list">
                        ${all.map((song, i) => this.renderSongRow(song, i + 1)).join('')}
                    </div>
                    ${songs.length === 0 ? '<div class="empty-state"><i class="fas fa-music"></i><p>No songs yet. Import your library to get started.</p></div>' : ''}
                </section>
            </div>
        `;
    },

    renderLibrary(songs) {
        const content = document.getElementById('mainContent');
        if (!content) return;

        // Group by artist
        const byArtist = {};
        songs.forEach(song => {
            const artist = song.artist || 'Unknown Artist';
            if (!byArtist[artist]) byArtist[artist] = [];
            byArtist[artist].push(song);
        });

        const artists = Object.keys(byArtist).sort();

        content.innerHTML = `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Library</h1>
                    <p class="page-subtitle">${songs.length} songs</p>
                </div>
                
                <div class="library-layout">
                    <div class="artists-sidebar">
                        ${artists.map(artist => `
                            <div class="artist-chip" onclick="scrollToArtist('${this.escapeHtml(artist)}')">
                                <span class="artist-letter" style="background: ${byArtist[artist][0].artColor || 'var(--glass-2)'}">${byArtist[artist][0].artLetter || '♪'}</span>
                                <span class="artist-name">${this.escapeHtml(artist)}</span>
                                <span class="artist-count">${byArtist[artist].length}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="songs-main">
                        ${artists.map(artist => `
                            <div class="artist-section" id="artist-${this.escapeHtml(artist).replace(/[^a-zA-Z0-9]/g, '-')}">
                                <h3 class="artist-header">${this.escapeHtml(artist)}</h3>
                                <div class="song-list">
                                    ${byArtist[artist].map((song, i) => this.renderSongRow(song, i + 1)).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${songs.length === 0 ? '<div class="empty-state"><i class="fas fa-music"></i><p>Import music to see your library here.</p></div>' : ''}
            </div>
        `;
    },

    renderSearch() {
        const content = document.getElementById('mainContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Search</h1>
                </div>
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search songs, artists, albums..." id="searchInput" oninput="handleSearch(this.value)" autofocus>
                </div>
                <div id="searchResults"></div>
            </div>
        `;
    },

    renderSearchResults(songs) {
        const results = document.getElementById('searchResults');
        if (!results) return;

        if (songs.length === 0) {
            results.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No results found</p></div>';
            return;
        }

        results.innerHTML = `
            <div class="song-list">
                ${songs.map((song, i) => this.renderSongRow(song, i + 1)).join('')}
            </div>
        `;
    },

    renderLiked(songs) {
        const content = document.getElementById('mainContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page">
                <div class="page-header liked-header">
                    <div class="liked-icon"><i class="fas fa-heart"></i></div>
                    <h1 class="page-title">Liked Songs</h1>
                    <p class="page-subtitle">${songs.length} songs</p>
                </div>
                <div class="song-list">
                    ${songs.map((song, i) => this.renderSongRow(song, i + 1)).join('')}
                </div>
                ${songs.length === 0 ? '<div class="empty-state"><i class="fas fa-heart"></i><p>No liked songs yet. Click the heart on any song to add it here.</p></div>' : ''}
            </div>
        `;
    },

    renderSettings() {
        const content = document.getElementById('mainContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Settings</h1>
                </div>
                <div class="settings-list">
                    <div class="setting-item" onclick="addMoreMusic()">
                        <div class="setting-info">
                            <i class="fas fa-folder-plus"></i>
                            <div>
                                <span class="setting-label">Add More Music</span>
                                <span class="setting-desc">Import more songs to your library</span>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    <div class="setting-item danger" onclick="resetLibrary()">
                        <div class="setting-info">
                            <i class="fas fa-trash"></i>
                            <div>
                                <span class="setting-label">Reset Library</span>
                                <span class="setting-desc">Remove all songs and start over</span>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
    },

    renderImport() {
        const content = document.getElementById('mainContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Import Music</h1>
                    <p class="page-subtitle">Add more songs to your library</p>
                </div>
                <div class="import-zone">
                    <div class="import-card">
                        <i class="fas fa-folder-open"></i>
                        <h3>Select Music Folder</h3>
                        <p>Choose a folder containing your music files</p>
                        <button class="btn-elegant primary" onclick="startImport()">
                            <i class="fas fa-folder-open"></i>
                            <span>Browse</span>
                        </button>
                    </div>
                    <p class="import-formats">Supported: MP3, FLAC, WAV, AAC, OGG, M4A, WMA</p>
                </div>
            </div>
        `;
    },

    renderCard(song) {
        return `
            <div class="card" onclick="playSong('${song.id}')">
                <div class="card-art" style="background: ${song.artColor || 'var(--glass-2)'};">
                    <span class="art-letter">${song.artLetter || '♪'}</span>
                    <button class="card-play" onclick="event.stopPropagation(); playSong('${song.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="card-info">
                    <div class="card-title">${this.escapeHtml(song.title)}</div>
                    <div class="card-artist">${this.escapeHtml(song.artist)}</div>
                    <div class="card-album">${song.album && song.album !== 'Unknown Album' ? this.escapeHtml(song.album) : ''}</div>
                </div>
            </div>
        `;
    },

    renderSongRow(song, num) {
        const isPlaying = Player.currentSong && Player.currentSong.id === song.id && Player.isPlaying;
        return `
            <div class="song-item ${isPlaying ? 'playing' : ''}" onclick="playSong('${song.id}')">
                <div class="song-art-mini" style="background: ${song.artColor || 'var(--glass-2)'};">
                    <span>${song.artLetter || '♪'}</span>
                </div>
                <div class="song-details">
                    <div class="song-title">${this.escapeHtml(song.title)}</div>
                    <div class="song-meta">${this.escapeHtml(song.artist)}${song.album && song.album !== 'Unknown Album' ? ' — ' + this.escapeHtml(song.album) : ''}</div>
                </div>
                <div class="song-time">${song.duration || '0:00'}</div>
            </div>
        `;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
