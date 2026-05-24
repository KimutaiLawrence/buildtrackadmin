export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#080F1E',
        navy2: '#0D1829',
        navy3: '#122038',
        gold: '#C9963C',
        'bt-green': '#27B87A',
        'bt-amber': '#E8A020',
        'bt-red': '#E05454',
        'bt-white': '#F2EDE4',
        'bt-muted': 'rgba(242,237,228,0.55)',
        'bt-border': 'rgba(201,150,60,0.18)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
