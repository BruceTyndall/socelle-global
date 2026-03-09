/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Socelle — Mineral Intelligence Design System ────────────
        // Core background system
        mn: {
          bg:          '#F6F3EF',   // porcelain mineral — page background (Pearl Mineral V2)
          surface:     '#EFEBE6',   // soft stone — alternate surface
          card:        '#FFFFFF',   // card / elevated surface
          dark:        '#1F2428',   // carbon slate — dark contrast panels
          footer:      '#15191D',   // deep graphite — footer / deep intelligence
        },
        // Text system
        graphite:      '#141418',   // primary text on light (Pearl Mineral V2 — #141418 locked)
        background:    '#F6F3EF',   // page background (Pearl Mineral V2 — alias of mn.bg)
        // Accent system
        accent: {
          DEFAULT:     '#6E879B',   // mineral slate blue
          hover:       '#5A7185',   // accent hover / active (Pearl Mineral V2 locked)
          soft:        '#E8EDF1',   // soft panels (Pearl Mineral V2 locked)
        },
        // Signal colors
        signal: {
          up:          '#5F8A72',   // positive / upward
          warn:        '#A97A4C',   // warning / attention
          down:        '#8E6464',   // negative / decline
        },

        // ── Legacy semantic tokens (portals) ────────────────────────
        brand: {
          bg:           '#F5F3F0',
          'bg-alt':     '#EDEDE5',
          surface:      '#FFFFFF',
          'surface-alt':'#FBF9F5',
          border:       '#D6D1C9',
          'border-dark':'#B8B2A9',
          text:         '#1A1714',
          'text-muted': '#6B6560',
          'text-light': '#5C5652',
          accent:       '#8C6B6E',
          'accent-dark':'#6E5254',
          gold:         '#D4A44C',
          'gold-light': '#E0BA72',
        },
        // ── Intelligence layer (portal dashboards) ─────────────────
        intel: {
          dark:    '#0F1419',
          slate:   '#1A2332',
          border:  '#2A3544',
          text:    '#94A3B8',
          accent:  '#3B82F6',
          up:      '#22C55E',
          down:    '#EF4444',
          stable:  '#94A3B8',
        },
        edu: {
          primary: '#7C3AED',
          light:   '#EDE9FE',
          accent:  '#A78BFA',
        },
        data: {
          1: '#3B82F6',
          2: '#6366F1',
          3: '#8B5CF6',
          4: '#A855F7',
          5: '#D946EF',
          6: '#EC4899',
          7: '#F43F5E',
        },

        // ── Warm Cocoa Palette — PORTAL-SCOPED (W12-25) ────────────
        // These generate Tailwind utilities (bg-cocoa, text-page-main, etc.)
        // FORBIDDEN on public pages (src/pages/public/*).
        // CSS vars are scoped to .portal-context in index.css.
        // Tailwind utilities remain global for portal pages that use them directly.
        cocoa: {
          DEFAULT: '#47201c',   // primary text & brand — PORTAL ONLY
          deep:    '#29120f',   // darkest (footer / deep panels) — PORTAL ONLY
          neutral: '#ac9b98',   // neutral / placeholder — PORTAL ONLY
        },
        page: {
          main:       '#f8f6f2',   // warm off-white — PORTAL ONLY
          alt:        '#f3e9e3',   // peach section tint — PORTAL ONLY
          'near-white':'#faf9f5',  // near-white card bg — PORTAL ONLY
        },
        // Design-system palette swatches — PORTAL ONLY
        'ds-red':    { 400: '#ff6568' },
        'ds-orange': { 50: '#fff7ed', 400: '#ff8b1a', 700: '#c53c00' },
        'ds-yellow': { 400: '#fac800' },
        'ds-green':  { 50: '#f0fdf4', 400: '#05df72', 600: '#00a544', 900: '#0d542b' },
        'ds-teal':   { 400: '#00d3bd' },
        'ds-blue':   { 400: '#54a2ff' },
        'ds-purple': { 200: '#e9d5ff', 400: '#c07eff' },
        'ds-gray':   { 300: '#d1d5dc', 700: '#364153', 900: '#101828' },
      },
      fontFamily: {
        // ── Universal Font System (FOUND-WO-06) ──────────────────────────
        // All font usage goes through CSS variables. Change --font-primary
        // in index.css = change ALL fonts site-wide without touching components.
        // Primary — General Sans via Fontshare CDN (ALL text on ALL public pages)
        sans:    ['var(--font-primary)', 'system-ui', 'sans-serif'],
        // Display — same as primary by default; override --font-display for editorial headlines
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Mono — JetBrains Mono for data values, timestamps, deltas ONLY
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // Legacy alias — BANNED on public pages
        serif:   ['Georgia', 'serif'],       // was DM Serif Display — BANNED
      },
      fontSize: {
        // ── Mineral display scale ──
        'hero':       ['clamp(3.5rem, 5.5vw, 5.25rem)', { lineHeight: '1.04', letterSpacing: '-0.025em', fontWeight: '400' }],
        'section':    ['clamp(2.5rem, 3.5vw, 3.5rem)',   { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '400' }],
        'subsection': ['clamp(1.75rem, 2.5vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '500' }],
        'body-lg':    ['1.25rem',  { lineHeight: '1.65', fontWeight: '400' }],
        'body':       ['1.125rem', { lineHeight: '1.65', fontWeight: '400' }],
        'eyebrow':    ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '500', textTransform: 'uppercase' }],
        'label':      ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '600' }],
        // ── Intelligence metrics ──
        'metric-xl': ['4rem',    { lineHeight: '1',    letterSpacing: '-0.03em', fontWeight: '700' }],
        'metric-lg': ['3rem',    { lineHeight: '1',    letterSpacing: '-0.025em', fontWeight: '700' }],
        'metric-md': ['2.25rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        // ── Legacy display (portals) ──
        'display-xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.005em' }],
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '10px',
        xl:   '12px',
        '2xl': '16px',
        '3xl': '20px',
        // ── Mineral design system ──
        'card':    '28px',
        'section': '32px',
        'pill':    '9999px',
        // ── Warm Cocoa border radii — PORTAL ONLY (W12-25) ──
        'ds-small':  '24px',   // var(--border-radius-small) @ desktop — PORTAL ONLY
        'ds-medium': '40px',   // var(--border-radius-medium) @ desktop — PORTAL ONLY
        'ds-large':  '88px',   // var(--border-radius-large) @ desktop — PORTAL ONLY
        'ds-card':   '48px',   // var(--border-radius-card) — PORTAL ONLY
      },
      boxShadow: {
        // ── Mineral shadows ──
        'soft':      '0 8px 24px rgba(19, 24, 29, 0.06)',
        'panel':     '0 20px 60px rgba(19, 24, 29, 0.12)',
        // ── Legacy shadows (portals) ──
        'card':      '0 1px 2px 0 rgba(26,23,20,0.04)',
        'card-hover':'0 2px 8px 0 rgba(26,23,20,0.06), 0 1px 2px 0 rgba(26,23,20,0.03)',
        'elevated':  '0 4px 16px 0 rgba(26,23,20,0.08), 0 1px 3px 0 rgba(26,23,20,0.04)',
        'dropdown':  '0 8px 24px 0 rgba(26,23,20,0.10), 0 2px 6px 0 rgba(26,23,20,0.04)',
        'modal':     '0 20px 60px -12px rgba(26,23,20,0.16), 0 8px 20px -6px rgba(26,23,20,0.06)',
        'navy':      '0 4px 14px 0 rgba(140,107,110,0.15)',
        'inner':     'inset 0 1px 2px 0 rgba(26,23,20,0.04)',
        'signal':      '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'signal-hover':'0 0 0 1px rgba(59, 130, 246, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4)',
        'glow-gold':   '0 0 20px rgba(212, 164, 76, 0.15)',
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.15)',
        'glass':       '0 4px 24px rgba(19, 24, 29, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        'glass-hover': '0 8px 40px rgba(19, 24, 29, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      },
      minHeight: { touch: '44px' },
      minWidth:  { touch: '44px' },
      spacing:   {
        'safe-t': 'env(safe-area-inset-top, 0px)',
        'safe-r': 'env(safe-area-inset-right, 0px)',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        'safe-l': 'env(safe-area-inset-left, 0px)',
      },
      transitionTimingFunction: {
        'brand':     'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap':      'cubic-bezier(0, 0, 1, 1)',       // --ease-snap: instant bg/color changes
        'cinematic': 'cubic-bezier(0.75, 0, 0.25, 1)', // --ease-cinematic: scroll reveals, transforms
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'counter-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'signal-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        'blur-reveal': {
          '0%':   { opacity: '0', filter: 'blur(12px)', transform: 'translateY(24px)' },
          '100%': { opacity: '1', filter: 'blur(0px)',  transform: 'translateY(0)' },
        },
        'ken-burns': {
          '0%':   { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.08)' },
        },
        'gradient-slide': {
          '0%':   { backgroundSize: '0% 40%' },
          '100%': { backgroundSize: '100% 40%' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.35s ease-out forwards',
        'slide-up':       'slide-up 0.45s ease-out forwards',
        'counter-up':     'counter-up 0.6s ease-out forwards',
        'pulse-subtle':   'pulse-subtle 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'signal-pulse':   'signal-pulse 3s ease-in-out infinite',
        'blur-reveal':    'blur-reveal 0.8s ease-out forwards',
        'ken-burns':      'ken-burns 14s ease-out forwards',
        'gradient-slide': 'gradient-slide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
    },
  },
  plugins: [],
};
