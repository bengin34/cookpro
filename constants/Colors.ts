const tintColorLight = '#e25822';
const tintColorDark = '#ff6b4a';

export default {
  light: {
    // Light mode: warm, inviting palette
    text: '#1f1a14', // Dark brown text
    background: '#ffffff', // Pure white background
    tint: tintColorLight, // Orange accent
    tabIconDefault: '#b8b0a6', // Light gray for inactive tabs
    tabIconSelected: tintColorLight, // Orange for active tabs
    // Additional light mode colors
    cardBackground: 'rgba(255,255,255,0.8)',
    secondaryText: 'rgba(31,26,20,0.6)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  dark: {
    // Dark mode: deep, sophisticated palette (Liquid Glass aesthetic)
    text: '#f5f1ed', // Light cream text
    background: '#0f0d0b', // Deep dark background
    tint: tintColorDark, // Brighter orange for dark mode
    tabIconDefault: '#504839', // Dark gray for inactive tabs
    tabIconSelected: tintColorDark, // Bright orange for active tabs
    // Additional dark mode colors
    cardBackground: 'rgba(255,255,255,0.08)', // Subtle glass effect
    secondaryText: 'rgba(245,241,237,0.6)', // Muted light text
    borderColor: 'rgba(255,255,255,0.15)', // Subtle borders for glass effect
    // Dark mode specific
    surfaceElevated: 'rgba(255,255,255,0.12)', // Slightly elevated surface
    accentDark: '#c2410c', // Darker orange for dark mode backgrounds
  },
};
