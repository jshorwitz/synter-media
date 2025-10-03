/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="tactical"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        carbon: {
          900: 'var(--bg-carbon-900)',
          850: 'var(--bg-carbon-850)',
          800: 'var(--bg-carbon-800)',
          700: 'var(--bg-carbon-700)'
        },
        stroke: {
          1: 'var(--stroke-1)',
          2: 'var(--stroke-2)'
        },
        text: {
          hi: 'var(--text-hi)',
          mid: 'var(--text-mid)',
          low: 'var(--text-low)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)'
        },
        accent: {
          red: 'var(--accent-red)',
          amber: 'var(--accent-amber)',
          lime: 'var(--accent-lime)',
          cyan: 'var(--accent-cyan)',
          yellow: 'var(--accent-yellow)',
          green: 'var(--sentinel-green)',
          teal: 'var(--stealth-teal)'
        },
        danger: {
          DEFAULT: 'var(--danger-red)'
        }
      },
      boxShadow: {
        'soft-glow': 'var(--soft-glow)',
        'focus-ring': 'var(--focus-ring)'
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glitch: {
          '0%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-1px,1px)' },
          '40%': { transform: 'translate(1px,-1px)' },
          '60%': { transform: 'translate(-1px,0)' },
          '80%': { transform: 'translate(1px,1px)' },
          '100%': { transform: 'translate(0,0)' }
        },
        sweep: {
          '0%': { opacity: '0' },
          '10%': { opacity: '0.25' },
          '90%': { opacity: '0.25' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        scan: 'scan 1.4s linear infinite',
        glitch: 'glitch 40ms steps(2, end) 1',
        sweep: 'sweep 4s linear infinite'
      },
      borderRadius: {
        tactical: '6px'
      },
      transitionTimingFunction: {
        tactical: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.panel': {
          backgroundColor: 'var(--bg-carbon-850)',
          border: '1px solid var(--stroke-1)',
          borderRadius: '6px',
          padding: '12px'
        },
        '.panel-title': {
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-low)'
        }
      });
    }
  ]
}
