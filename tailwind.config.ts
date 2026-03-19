import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0F0F11',
          raised: '#17171A',
          overlay: '#1E1E24',
          border: '#2A2A35',
        },
        accent: {
          DEFAULT: '#7C6AF7',
          light: '#9D8FFF',
          glow: 'rgba(124, 106, 247, 0.15)',
          meta: '#1877F2',
          google: '#4285F4',
          naver: '#03C75A',
        },
        text: {
          primary: '#F2F2F5',
          secondary: '#8E8EA0',
          muted: '#52525E',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124, 106, 247, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 106, 247, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
