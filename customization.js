/**
 * Customization Examples & Presets
 * Copy and paste these into your browser console or config.js
 */

// ===== PRESET THEMES =====
const PRESETS = {
    // Cyberpunk theme
    cyberpunk: {
        primary: '#00ff00',
        primaryDark: '#00cc00',
        secondary: '#ff00ff',
        tertiary: '#00ffff',
        accent1: '#ff0080',
        accent2: '#ffaa00',
    },

    // Sunset theme
    sunset: {
        primary: '#ff6b35',
        primaryDark: '#d94a1a',
        secondary: '#ffb703',
        tertiary: '#fb5607',
        accent1: '#ff006e',
        accent2: '#ffaa00',
    },

    // Ocean theme
    ocean: {
        primary: '#0096c7',
        primaryDark: '#006699',
        secondary: '#00b4d8',
        tertiary: '#90e0ef',
        accent1: '#00d9ff',
        accent2: '#48cae4',
    },

    // Forest theme
    forest: {
        primary: '#2d6a4f',
        primaryDark: '#1b4332',
        secondary: '#40916c',
        tertiary: '#95d5b2',
        accent1: '#d8f3dc',
        accent2: '#52b788',
    },

    // Berry theme
    berry: {
        primary: '#c41e3a',
        primaryDark: '#8b1429',
        secondary: '#d62246',
        tertiary: '#ff006e',
        accent1: '#a8004d',
        accent2: '#e60073',
    },

    // Space theme
    space: {
        primary: '#2e294e',
        primaryDark: '#1f1b2e',
        secondary: '#512da8',
        tertiary: '#00d9ff',
        accent1: '#7c3aed',
        accent2: '#4c0080',
    },

    // Mint theme
    mint: {
        primary: '#00d9a3',
        primaryDark: '#00b385',
        secondary: '#00f5ff',
        tertiary: '#00ffa3',
        accent1: '#00ffaa',
        accent2: '#00d9ff',
    }
};

// ===== QUICK SETUP FUNCTIONS =====

/**
 * Apply a preset theme
 * Usage: applyPreset('cyberpunk')
 */
function applyPreset(presetName) {
    if (PRESETS[presetName]) {
        CONFIG.colors['custom'] = { ...PRESETS[presetName] };
        CONFIG.setTheme('custom');
        console.log(`✅ Applied "${presetName}" theme!`);
    } else {
        console.log('❌ Preset not found. Available:', Object.keys(PRESETS));
    }
}

/**
 * Customize player button size
 * Usage: setButtonSize('large')
 */
function setButtonSize(size) {
    const sizes = {
        small: { play: '70px', control: '50px', font: '1.5rem' },
        normal: { play: '85px', control: '55px', font: '2rem' },
        large: { play: '100px', control: '65px', font: '2.2rem' },
    };
    
    if (sizes[size]) {
        const root = document.documentElement;
        root.style.setProperty('--play-btn-size', sizes[size].play);
        root.style.setProperty('--control-btn-size', sizes[size].control);
        console.log(`✅ Button size set to: ${size}`);
    }
}

/**
 * Toggle dark/light mode
 * Usage: toggleDarkMode()
 */
function toggleDarkMode() {
    const isDark = document.body.style.filter === 'invert(1)';
    document.body.style.filter = isDark ? 'none' : 'invert(1)';
    console.log(`✅ Dark mode ${isDark ? 'off' : 'on'}`);
}

/**
 * Show theme colors in console
 * Usage: showThemeColors()
 */
function showThemeColors() {
    const colors = CONFIG.colors[CONFIG.theme];
    console.log(`Current Theme: ${CONFIG.theme}`);
    console.log('%c Primary', `background: ${colors.primary}; color: white; padding: 10px;`);
    console.log('%c Secondary', `background: ${colors.secondary}; color: white; padding: 10px;`);
    console.log('%c Tertiary', `background: ${colors.tertiary}; color: white; padding: 10px;`);
    console.log('%c Accent 1', `background: ${colors.accent1}; color: white; padding: 10px;`);
    console.log('%c Accent 2', `background: ${colors.accent2}; color: white; padding: 10px;`);
}

/**
 * Export app state
 * Usage: exportState()
 */
function exportState() {
    const state = {
        theme: CONFIG.theme,
        colors: CONFIG.colors[CONFIG.theme],
        features: CONFIG.features,
        likedSongs: Array.from(app.likedSongs),
        currentTrack: app.currentTrackIndex,
        timestamp: new Date().toISOString()
    };
    
    console.log('App State:', state);
    console.log(JSON.stringify(state, null, 2));
    return state;
}

/**
 * Reset to default theme
 * Usage: resetTheme()
 */
function resetTheme() {
    CONFIG.setTheme('neon-green');
    location.reload();
    console.log('✅ Reset to default theme');
}

/**
 * Create a neon theme with custom primary color
 * Usage: createNeonTheme('#FF00FF')
 */
function createNeonTheme(primaryColor) {
    CONFIG.colors['neon-custom'] = {
        primary: primaryColor,
        primaryDark: THEME_BUILDER.darkenColor(primaryColor, 20),
        secondary: '#FF00FF',
        tertiary: '#00FFFF',
        accent1: '#FFFF00',
        accent2: '#FF00AA',
    };
    CONFIG.setTheme('neon-custom');
    console.log(`✅ Created neon theme with primary: ${primaryColor}`);
}

/**
 * Bulk import custom songs
 * Usage: importSongs([{ title: 'Song', artist: 'Artist', ... }])
 */
function importSongs(songs) {
    songs.forEach(song => {
        if (!song.id) song.id = CONFIG.musicLibrary.length + 1;
        CONFIG.musicLibrary.push(song);
    });
    app.renderUI();
    console.log(`✅ Imported ${songs.length} songs`);
}

/**
 * List all key customization options
 * Usage: showCustomizationMenu()
 */
function showCustomizationMenu() {
    console.log(`
╔══════════════════════════════════════╗
║   SoundWave Customization Menu       ║
╚══════════════════════════════════════╝

🎨 THEMES:
  • applyPreset('cyberpunk')
  • applyPreset('sunset')
  • applyPreset('ocean')
  • applyPreset('forest')
  CONFIG.setTheme('neon-green')

🎮 CONTROLS:
  • app.togglePlay()
  • app.nextTrack()
  • app.previousTrack()

⚙️  CONFIG:
  • CONFIG.theme = 'cyan'
  • CONFIG.features.waveform = false
  • showThemeColors()

📊 STATS:
  • exportState()
  • app.likedSongs

🎵 MUSIC:
  • CONFIG.musicLibrary (view all songs)
  • importSongs([...])

💡 EXAMPLES:
  Type: showCustomizationMenu()
    `);
}

// ===== AUTO EXECUTE ON LOAD =====
console.log('🎨 Customization utilities loaded!');
console.log('📖 Type: showCustomizationMenu() to see all options');
console.log('🎯 Quick: applyPreset("cyberpunk") or applyPreset("sunset")');
