/**
 * Theme Builder - Create and manage custom themes
 * Usage: Import this file and use THEME_BUILDER to create themes
 */

const THEME_BUILDER = {
    // Create a new theme
    createTheme(themeName, colors) {
        CONFIG.colors[themeName] = colors;
        CONFIG.save();
        console.log(`✅ Theme "${themeName}" created!`);
    },

    // Export current theme as JSON
    exportTheme() {
        const currentColors = CONFIG.colors[CONFIG.theme];
        return {
            name: CONFIG.theme,
            colors: currentColors,
            features: CONFIG.features,
            typography: CONFIG.typography
        };
    },

    // Import theme from JSON
    importTheme(themeData) {
        if (themeData.colors && themeData.name) {
            CONFIG.colors[themeData.name] = themeData.colors;
            CONFIG.theme = themeData.name;
            CONFIG.applyTheme();
            CONFIG.save();
            console.log(`✅ Theme "${themeData.name}" imported!`);
            return true;
        }
        return false;
    },

    // Get all available themes
    getAvailableThemes() {
        return Object.keys(CONFIG.colors);
    },

    // Get current theme colors
    getCurrentThemeColors() {
        return CONFIG.colors[CONFIG.theme];
    },

    // Modify specific color in current theme
    setColor(colorKey, hexValue) {
        CONFIG.colors[CONFIG.theme][colorKey] = hexValue;
        CONFIG.applyTheme();
        CONFIG.save();
        console.log(`✅ Color "${colorKey}" set to ${hexValue}`);
    },

    // Create a gradient theme
    createGradientTheme(themeName, colorStart, colorEnd) {
        CONFIG.colors[themeName] = {
            primary: colorStart,
            primaryDark: this.darkenColor(colorStart, 20),
            secondary: colorEnd,
            tertiary: this.mixColors(colorStart, colorEnd, 0.5),
            accent1: colorEnd,
            accent2: this.lightenColor(colorStart, 20),
        };
        CONFIG.save();
        console.log(`✅ Gradient theme "${themeName}" created!`);
    },

    // Darken a color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    // Lighten a color
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    // Mix two colors
    mixColors(color1, color2, weight = 0.5) {
        const c1 = parseInt(color1.replace("#", ""), 16);
        const c2 = parseInt(color2.replace("#", ""), 16);
        const R = Math.round((c1 >> 16) * (1 - weight) + (c2 >> 16) * weight);
        const G = Math.round(((c1 >> 8) & 0xFF) * (1 - weight) + ((c2 >> 8) & 0xFF) * weight);
        const B = Math.round((c1 & 0xFF) * (1 - weight) + (c2 & 0xFF) * weight);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    // Get contrasting text color (black or white)
    getContrastColor(hexColor) {
        const num = parseInt(hexColor.replace("#", ""), 16);
        const brightness = ((num >> 16) * 299 + ((num >> 8) & 0xFF) * 587 + (num & 0xFF) * 114) / 1000;
        return brightness > 128 ? "#000000" : "#FFFFFF";
    },

    // Generate random color
    generateRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    },

    // Create random theme
    createRandomTheme(themeName = 'random') {
        const primary = this.generateRandomColor();
        this.createGradientTheme(themeName, primary, this.generateRandomColor());
        console.log(`✅ Random theme "${themeName}" created!`);
    },

    // Get theme preview (HTML)
    getThemePreview(themeName) {
        const colors = CONFIG.colors[themeName];
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <div style="background: ${colors.primary}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Primary</div>
                <div style="background: ${colors.secondary}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Secondary</div>
                <div style="background: ${colors.tertiary}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Tertiary</div>
                <div style="background: ${colors.accent1}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Accent 1</div>
                <div style="background: ${colors.accent2}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Accent 2</div>
                <div style="background: ${colors.primaryDark}; padding: 20px; border-radius: 10px; color: white; text-align: center; font-weight: bold;">Primary Dark</div>
            </div>
        `;
    },

    // Log all themes
    listAllThemes() {
        console.log('Available Themes:');
        Object.keys(CONFIG.colors).forEach(name => {
            console.log(`  - ${name}`, CONFIG.colors[name]);
        });
    },

    // Quick examples
    examples() {
        console.log('Example 1: Create a custom theme');
        console.log(`THEME_BUILDER.createTheme('myTheme', {
            primary: '#FF0000',
            primaryDark: '#CC0000',
            secondary: '#00FF00',
            tertiary: '#0000FF',
            accent1: '#FFFF00',
            accent2: '#00FFFF'
        });`);

        console.log('\nExample 2: Create gradient theme');
        console.log(`THEME_BUILDER.createGradientTheme('myGradient', '#FF0000', '#0000FF');`);

        console.log('\nExample 3: Switch theme');
        console.log(`CONFIG.setTheme('myTheme');`);

        console.log('\nExample 4: Modify color');
        console.log(`THEME_BUILDER.setColor('primary', '#00FF00');`);

        console.log('\nExample 5: Export theme');
        console.log(`const exported = THEME_BUILDER.exportTheme();
console.log(exported);`);
    }
};

// Make available in console
console.log('🎨 Theme Builder loaded! Use THEME_BUILDER.examples() to see usage.');
