# SoundWave - Complete Customization Guide

## 🎯 Overview

This guide covers everything you need to customize SoundWave to match your design preferences. All customization is done through simple configuration files - **no coding experience needed!**

---

## 📂 File Structure & Where to Customize

```
index.html           ← Main page (don't edit unless adding new elements)
config.js            ← 🎨 MAIN CUSTOMIZATION FILE
app.js              ← Application logic (usually don't need to edit)
styles.css          ← CSS styles (uses variables from config.js)
theme-builder.js    ← Advanced theme creation utility
customization.js    ← Preset themes & quick functions
styles.css          ← Typography & spacing
```

---

## 🎨 1. Theme Customization

### Easiest Way: Use a Preset Theme

In your browser console, type:
```javascript
applyPreset('cyberpunk');   // Try this!
applyPreset('sunset');
applyPreset('ocean');
applyPreset('forest');
applyPreset('berry');
applyPreset('space');
applyPreset('mint');
```

OR edit `config.js` line 13:
```javascript
theme: 'ocean'  // Change from 'neon-green' to any preset
```

### Create a Custom Theme

Edit `config.js` and find the `colors` object:

```javascript
colors: {
    // Add your own theme:
    'my-awesome-theme': {
        primary: '#FF0000',           // Main button color
        primaryDark: '#CC0000',       // Darker variant
        secondary: '#FF007F',         // Secondary accent
        tertiary: '#00FFFF',          // Tertiary accent  
        accent1: '#FF00FF',           // Extra colors
        accent2: '#FFAA00',           // for variety
    }
}
```

Then set it as active:
```javascript
theme: 'my-awesome-theme'
```

### Color Format

Use **hexadecimal colors** (#RRGGBB):
- `#FF0000` = Red
- `#00FF00` = Green
- `#0000FF` = Blue
- `#FFFF00` = Yellow
- `#FF00FF` = Magenta
- `#00FFFF` = Cyan

**Pro Tip:** Use a color picker tool like [color-hex.com](https://www.color-hex.com) to find perfect colors!

---

## 🎮 2. Feature Toggles

In `config.js`, find the `features` object and toggle on/off:

```javascript
features: {
    waveform: true,        // Show audio waveform (true/false)
    circularPlayer: false, // Circular player design (coming soon)
    categoryBrowse: true,  // Show genre categories
    lyrics: true,          // Show lyrics tab
    queue: true,           // Show "Up Next" queue
    playlists: true,       // Playlist management
    sharing: true,         // Share song button
}
```

**Examples:**
```javascript
// Minimal player - just basics:
features: {
    waveform: false,
    queue: false,
    lyrics: false,
    categoryBrowse: false,
}

// Enhanced experience:
features: {
    waveform: true,
    queue: true,
    lyrics: true,
    categoryBrowse: true,
}
```

---

## 🎵 3. Music & Categories

### Add Your Own Songs

Edit the `musicLibrary` array in `config.js`:

```javascript
musicLibrary: [
    {
        id: 1,
        title: 'Song Name',
        artist: 'Artist Name',
        duration: '3:45',        // Format: M:SS
        image: 'https://image-url.jpg',
        category: 'Genre Name'
    },
    // Add more songs...
]
```

**Pro Tips:**
- Use image URLs that work on all browsers
- Keep duration format consistent (M:SS)
- Category must match one in the categories array
- Use a service like Unsplash for free music art

### Create Custom Categories

Edit the `categories` array:

```javascript
categories: [
    { name: 'All', emoji: '🎵' },
    { name: 'Rock', emoji: '🎸' },
    { name: 'Hip-Hop', emoji: '🎤' },
    { name: 'Electronic', emoji: '⚡' },
    { name: 'Jazz', emoji: '🎷' },
    { name: 'Classical', emoji: '🎻' },
    // Add your own!
    { name: 'Your Genre', emoji: '📺' },
]
```

**Available Emojis:**
- Music: 🎵 🎶 🎼 🎹 🎸 🎺 🎷 🥁 🎤 🎧
- Moods: 😎 😴 🤙 😡 💔 🔥 ✨ 🌙 ☀️
- Other: 🚀 💫 ⚡ ❄️ 🌊 🍕 🎉 🎯

---

## 🎨 4. Typography & Spacing

Make text bigger/smaller, adjust padding, etc.

### Typography

```javascript
typography: {
    fontFamily: "'Poppins', sans-serif",  // Change font
    headingSize: '2.2rem',                // Big titles
    titleSize: '1.6rem',                  // Song titles
    subtitleSize: '1rem',                 // Artist names
}
```

**Font options:**
- `'Poppins'` (current - rounded)
- `'Roboto'` (clean)
- `'Inter'` (modern)
- `'Courier'` (monospace)

### Spacing

Control padding and margins:

```javascript
spacing: {
    xs: 8,    // tiny
    sm: 12,   // small  
    md: 20,   // medium (most common)
    lg: 30,   // large
    xl: 40,   // extra large
}
```

### Border Radius

Control roundness of corners:

```javascript
borderRadius: {
    sm: '10px',    // Slightly rounded
    md: '15px',    // Medium
    lg: '25px',    // Very rounded
    xl: '40px',    // Circle-like
    full: '50%',   // Perfect circle
}
```

---

## 🌊 5. Glassmorphism (Glass Effects)

Control the frosted glass effect:

```javascript
glass: {
    blur: '50px',        // Increase for stronger blur (30px, 50px, 70px)
    opacity: 0.05,       // Background opacity (0.03 = very dark, 0.1 = lighter)
    borderOpacity: 0.1,  // Border visibility
}
```

**Examples:**
```javascript
// Subtle glass:
glass: {
    blur: '30px',
    opacity: 0.1,
    borderOpacity: 0.2,
}

// Heavy glass (like current):
glass: {
    blur: '50px',
    opacity: 0.05,
    borderOpacity: 0.1,
}
```

---

## 🎯 6. Layout & Animation

### Layout Style

```javascript
// Currently 'default' - more styles coming!
layout: 'default'
// Later: 'compact', 'modern', 'circular'
```

### Animation Speed

```javascript
animationSpeed: 'normal'  // 'fast', 'normal', 'slow'
```

---

## 💻 7. Using Browser Console Commands

Open **browser DevTools** (F12 or Ctrl+Shift+I) → Console tab

### Quick Commands

```javascript
// Apply preset theme
applyPreset('cyberpunk');
applyPreset('sunset');

// See all available themes
CONFIG.getColor('primary');

// Change single color
THEME_BUILDER.setColor('primary', '#FF0000');

// Show current colors
showThemeColors();

// Toggle features
CONFIG.toggleFeature('waveform');

// Export your settings (to save/share)
exportState();

// List all songs
CONFIG.musicLibrary

// Show custom menu
showCustomizationMenu();
```

---

## 🎨 8. Preset Themes Reference

### Cyberpunk 🤖
```javascript
primary: '#00ff00'
secondary: '#ff00ff'
```

### Sunset 🌅
```javascript
primary: '#ff6b35'
secondary: '#ffb703'
```

### Ocean 🌊
```javascript
primary: '#0096c7'
secondary: '#00b4d8'
```

### Forest 🌲
```javascript
primary: '#2d6a4f'
secondary: '#40916c'
```

### Berry 🍓
```javascript
primary: '#c41e3a'
secondary: '#d62246'
```

### Space 🚀
```javascript
primary: '#2e294e'
secondary: '#512da8'
```

### Mint 🌿
```javascript
primary: '#00d9a3'
secondary: '#00f5ff'
```

---

## 🚀 9. Advanced Customization

### Create a Gradient Theme

In `customization.js`:
```javascript
THEME_BUILDER.createGradientTheme('myGradient', '#FF0000', '#0000FF');
CONFIG.setTheme('myGradient');
```

### Generate Random Theme

```javascript
THEME_BUILDER.createRandomTheme('random');
```

### Import Bulk Songs

```javascript
importSongs([
    { title: 'Song 1', artist: 'Artist', duration: '3:45', image: 'url', category: 'Genre' },
    { title: 'Song 2', artist: 'Artist', duration: '4:12', image: 'url', category: 'Genre' },
]);
```

### Export & Backup Settings

```javascript
const backup = exportState();
console.log(JSON.stringify(backup));
// Copy and save this in a text file for backup!
```

---

## 🎓 10. Common Customization Scenarios

### Scenario 1: Dark Orange Theme (Like Spotify)
1. Edit `config.js` line 13:
```javascript
theme: 'orange'
```

### Scenario 2: Minimal/Compact Player
1. Find `features` in `config.js`
2. Set to false: waveform, queue, lyrics
3. Adjust spacing to make smaller

### Scenario 3: My Genre Festival App
1. Customize `categories` with your genres
2. Add songs to `musicLibrary`
3. Set `theme: 'cyan'` or create custom
4. Add festival name to welcome screen (HTML)

### Scenario 4: Dark Purple Gaming Vibes
```javascript
theme: 'custom',
colors: {
    custom: {
        primary: '#a855f7',    // Purple
        primaryDark: '#7c3aed',
        secondary: '#ec4899',  // Pink
        tertiary: '#06b6d4',   // Cyan
        accent1: '#8b5cf6',
        accent2: '#d946ef',
    }
}
```

---

## 🐛 Troubleshooting

### Colors not changing?
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+R or F5)
- Check you're editing the right theme name

### Features not showing?
- Set feature to `true` in `config.js`
- Reload page
- Check browser console for errors

### Songs not appearing?
- Verify category name matches exactly
- Check image URL works (visit in new tab)
- Make sure duration format is correct (M:SS)

### LocalStorage issues?
- Type in console: `localStorage.clear()`
- This resets all saved data
- Then reload page

---

## 📋 Quick Checklist

- [ ] Choose a theme or create custom
- [ ] Toggle features you want
- [ ] Add your own songs
- [ ] Customize categories
- [ ] Set typography preferences
- [ ] Test color scheme
- [ ] Save/backup settings
- [ ] Share with others!

---

## 🎁 Pro Tips

1. **Test before deploying**: Use incognito window
2. **Use hex color picker**: [Colordot.xyz](http://colordot.xyz/)
3. **Find song images**: [Unsplash](https://unsplash.com) or [Pexels](https://pexels.com)
4. **Backup settings**: `JSON.stringify(exportState())` → save to file
5. **Share themes**: Send config.js to friends
6. **Keyboard shortcuts**: 
   - F12 = Open DevTools
   - Ctrl+R = Reload
   - Ctrl+Shift+Delete = Clear cache

---

## 📚 More Resources

- [CSS Color Reference](https://htmlcolorcodes.com/)
- [Emoji List](https://unicode.org/emoji/charts/full-emoji-list.html)
- [Font Families](https://fonts.google.com/)
- [Design Inspiration](https://dribbble.com/)

---

**Happy customizing! 🎨🎵**
