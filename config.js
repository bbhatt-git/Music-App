/**
 * Theme & App Configuration
 * Customize colors, fonts, and UI options here
 */

const CONFIG = {
    // Theme Options: 'neon-green', 'orange', 'red', 'cyan', 'custom'
    theme: 'neon-green',

    // Customizable Colors
    colors: {
        'neon-green': {
            primary: '#a3ff12',
            primaryDark: '#7fb800',
            secondary: '#ff006e',
            tertiary: '#00f5ff',
            accent1: '#ff00ff',
            accent2: '#ffaa00',
        },
        'orange': {
            primary: '#ff6b35',
            primaryDark: '#d94a1a',
            secondary: '#ff1744',
            tertiary: '#00d4ff',
            accent1: '#ffaa00',
            accent2: '#ff00aa',
        },
        'red': {
            primary: '#ff0000',
            primaryDark: '#cc0000',
            secondary: '#ff007f',
            tertiary: '#00ffff',
            accent1: '#ffaa00',
            accent2: '#aa00ff',
        },
        'cyan': {
            primary: '#00f5ff',
            primaryDark: '#00cccc',
            secondary: '#ff006e',
            tertiary: '#a3ff12',
            accent1: '#ff00ff',
            accent2: '#ffaa00',
        },
        'custom': {
            primary: '#a3ff12',
            primaryDark: '#7fb800',
            secondary: '#ff006e',
            tertiary: '#00f5ff',
            accent1: '#ff00ff',
            accent2: '#ffaa00',
        }
    },

    // UI Features Toggle
    features: {
        waveform: true,           // Show waveform visualization
        circularPlayer: false,    // Use circular player design
        categoryBrowse: true,     // Show genre/mood categories
        lyrics: true,            // Show lyrics tab
        queue: true,             // Show up next queue
        playlists: true,         // Show playlist management
        sharing: true,           // Show sharing options
    },

    // Layout Options: 'default', 'compact', 'modern', 'circular'
    layout: 'default',

    // Animation Speed: 'fast', 'normal', 'slow'
    animationSpeed: 'normal',

    // Typography
    typography: {
        fontFamily: "'Poppins', sans-serif",
        headingSize: '2.2rem',
        titleSize: '1.6rem',
        subtitleSize: '1rem',
    },

    // Spacing (in pixels)
    spacing: {
        xs: 8,
        sm: 12,
        md: 20,
        lg: 30,
        xl: 40,
    },

    // Border radius
    borderRadius: {
        sm: '10px',
        md: '15px',
        lg: '25px',
        xl: '40px',
        full: '50%',
    },

    // Glass effect strength
    glass: {
        blur: '50px',     // backdrop blur
        opacity: 0.05,    // background opacity
        borderOpacity: 0.1,
    },

    // Music Library - NO MOCK DATA (users must import real music)
    musicLibrary: [],

    // Categories - loaded based on imported music
    categories: [],

    // Apply configuration
    applyTheme() {
        const themeColors = this.colors[this.theme];
        const root = document.documentElement;
        
        root.style.setProperty('--primary', themeColors.primary);
        root.style.setProperty('--primary-dark', themeColors.primaryDark);
        root.style.setProperty('--secondary', themeColors.secondary);
        root.style.setProperty('--tertiary', themeColors.tertiary);
        root.style.setProperty('--accent1', themeColors.accent1);
        root.style.setProperty('--accent2', themeColors.accent2);
    },

    // Get current color
    getColor(colorName) {
        return this.colors[this.theme][colorName];
    },

    // Toggle feature
    toggleFeature(featureName) {
        this.features[featureName] = !this.features[featureName];
        localStorage.setItem('musicAppConfig', JSON.stringify(this));
    },

    // Change theme
    setTheme(themeName) {
        this.theme = themeName;
        this.applyTheme();
        localStorage.setItem('musicAppConfig', JSON.stringify(this));
    },

    // Save to local storage
    save() {
        localStorage.setItem('musicAppConfig', JSON.stringify(this));
    },

    // Load from local storage
    load() {
        const saved = localStorage.getItem('musicAppConfig');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
        this.applyTheme();
    }
};

// Load configuration on page load
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.load();
});
