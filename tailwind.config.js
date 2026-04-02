/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'crucible-bg': 'var(--bg-primary)',
        'crucible-sidebar': 'var(--bg-sidebar)',
        'crucible-editor': 'var(--bg-editor)',
        'crucible-panel': 'var(--bg-panel)',
        'crucible-border': 'var(--border-color)',
        'crucible-text': 'var(--text-primary)',
        'crucible-text-secondary': 'var(--text-secondary)',
        'crucible-accent': 'var(--accent-color)',
        'crucible-hover': 'var(--hover-color)',
        'crucible-active': 'var(--active-color)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
