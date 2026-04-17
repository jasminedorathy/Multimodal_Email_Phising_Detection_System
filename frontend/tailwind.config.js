/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#F8FAFC',         // Soft light gray
          panel: '#FFFFFF',      // White
          card: '#FFFFFF',       // White
          border: '#E5E7EB',     // Light gray
          neon: '#2563EB',       // Primary Accent (Blue)
          neonGreen: '#16A34A',  // Success (Green)
          neonPurple: '#6366F1', // Indigo 
          neonRed: '#DC2626',    // Danger (Red)
          neonYellow: '#D97706', // Warning (Amber)
          text: '#111827',       // Dark text
          muted: '#6B7280',      // Muted text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        neon: '0 4px 14px 0 rgba(37,99,235,0.39)',
        neonGreen: '0 4px 14px 0 rgba(22,163,74,0.39)',
        neonRed: '0 4px 14px 0 rgba(220,38,38,0.39)',
        card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)",
        'cyber-gradient': 'linear-gradient(to right, #F8FAFC, #EEF2FF)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-neon': 'pulseNeon 3s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
