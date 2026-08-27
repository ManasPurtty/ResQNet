/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eoc: {
          bg: '#090d16',
          card: '#111827',
          panel: '#151e32',
          hover: '#1e293b',
          border: '#1e293b',
          accent: '#3b82f6',
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#10b981',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 4s linear infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5), inset 0 0 5px rgba(239, 68, 68, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.9), inset 0 0 10px rgba(239, 68, 68, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
