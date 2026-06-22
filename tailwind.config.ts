import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── BGTS Design System Colour Tokens ──────────────────────────────
      colors: {
        // Brand: Orange ramp (#E0731E primary)
        brand: {
          DEFAULT: '#E0731E',  // --orange-500
          hover:   '#C45F14',  // --orange-600
          subtle:  '#FEF4EB',  // --orange-50
          50:      '#FEF4EB',
          100:     '#FCDCBE',
          200:     '#F9BE90',
          300:     '#F5A160',
          400:     '#F08438',
          500:     '#E0731E',
          600:     '#C45F14',
          700:     '#A34D0D',
          800:     '#7F3C09',
          900:     '#5A2B06',
        },

        // Saffron accent (logo gold, gradient anchor)
        saffron: {
          DEFAULT: '#F1D24A',  // --saffron-300
          100:     '#FDF7CC',
          200:     '#F7E27C',
          300:     '#F1D24A',
          400:     '#E8BF20',
          500:     '#D4AA0C',
        },

        // Brick red (gradient end, emphasis)
        brick: {
          DEFAULT: '#C03030',  // --red-500
          400:     '#D94444',
          500:     '#C03030',
          600:     '#A52020',
        },

        // Ink: slate text ramp
        ink: {
          strong:  '#21211F',  // --slate-900 — headings
          body:    '#343432',  // --slate-800 — body copy
          muted:   '#777672',  // --slate-500 — captions, labels
          subtle:  '#A8A7A3',  // --slate-400
          ghost:   '#D6D5D0',  // --slate-200
        },

        // Surfaces
        surface: {
          page:    '#F6F6F4',  // --slate-50 — page background
          card:    '#FFFFFF',  // --slate-0
          inverse: '#131312',  // --slate-950 — footer/dark sections
          mid:     '#EEECEA',  // --slate-100
        },

        // EkoHaul green sub-brand
        eko: {
          DEFAULT: '#138A4F',  // --eko-500
          teal:    '#119C97',  // --eko-teal-500
          lime:    '#B7E84B',  // --eko-lime-300
          50:      '#E8F7EF',
          100:     '#BFEBD5',
          200:     '#8FDDB8',
          300:     '#5ECE9B',
          400:     '#32BF7E',
          500:     '#138A4F',
          600:     '#0F7242',
          700:     '#0C5B35',
          800:     '#084328',
          900:     '#042C1A',
          teal500: '#119C97',
          lime300: '#B7E84B',
        },

        // Status colours (consignment tracking)
        status: {
          booked:    '#2A6FB0',  // blue
          transit:   '#E0731E',  // orange (brand)
          delayed:   '#F1D24A',  // saffron
          delivered: '#138A4F',  // eko green
          exception: '#C03030',  // brick red
        },

        // Functional
        success: { DEFAULT: '#1F8A4C', light: '#E8F7EF' },
        info:    { DEFAULT: '#2A6FB0', light: '#EBF2FA' },
        warning: { DEFAULT: '#D4AA0C', light: '#FDF7CC' },
        error:   { DEFAULT: '#C03030', light: '#FDEAEA' },
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],  // --font-display
        body:    ['Hanken Grotesk', 'system-ui', 'sans-serif'],  // --font-body
        mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],  // --font-mono
        sans:    ['Hanken Grotesk', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],      // 11px
        xs:    ['0.75rem',   { lineHeight: '1.125rem' }],  // 12px
        sm:    ['0.875rem',  { lineHeight: '1.25rem' }],   // 14px
        base:  ['1rem',      { lineHeight: '1.5rem' }],    // 16px
        lg:    ['1.125rem',  { lineHeight: '1.625rem' }],  // 18px
        xl:    ['1.25rem',   { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem',  { lineHeight: '2.375rem' }],  // 30px
        '4xl': ['2.25rem',   { lineHeight: '2.75rem' }],   // 36px
        '5xl': ['3rem',      { lineHeight: '3.5rem' }],    // 48px
        '6xl': ['3.75rem',   { lineHeight: '4.25rem' }],   // 60px
        '7xl': ['5.25rem',   { lineHeight: '5.75rem' }],   // 84px
      },

      fontWeight: {
        regular:    '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // ─── Spacing (4px base grid) ────────────────────────────────────────
      spacing: {
        '0':  '0px',
        '1':  '0.25rem',  // 4px
        '2':  '0.5rem',   // 8px
        '3':  '0.75rem',  // 12px
        '4':  '1rem',     // 16px
        '5':  '1.25rem',  // 20px
        '6':  '1.5rem',   // 24px
        '8':  '2rem',     // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '32': '8rem',     // 128px
      },

      // ─── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        none: '0px',
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',    // --radius-md
        lg:   '12px',   // --radius-lg
        xl:   '16px',   // --radius-xl
        '2xl':'24px',
        pill: '999px',  // --radius-pill
        full: '9999px',
      },

      // ─── Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        brand:  '0 6px 18px rgba(224,115,30,0.30)',  // --shadow-brand
        eko:    '0 6px 18px rgba(19,138,79,0.25)',
        card:   '0 2px 8px rgba(33,33,31,0.08)',
        hover:  '0 4px 16px rgba(33,33,31,0.12)',
        nav:    '0 2px 16px rgba(33,33,31,0.10)',
        'inner-sm': 'inset 0 1px 2px rgba(33,33,31,0.06)',
      },

      // ─── Layout ─────────────────────────────────────────────────────────
      maxWidth: {
        container: '1280px',  // --container-xl
        content:   '720px',
        reading:   '64ch',
      },

      height: {
        header: '93px',       // --header-h (90px nav + 3px accent bar)
        'header-mobile': '60px',
      },

      // ─── Animation & Motion ─────────────────────────────────────────────
      transitionTimingFunction: {
        'ease-out-expo':  'cubic-bezier(0.22, 1, 0.36, 1)',    // --ease-out
        'ease-in-back':   'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'ease-out-back':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        fast:   '150ms',
        base:   '200ms',     // --dur-base
        slow:   '350ms',
        slower: '500ms',
      },

      keyframes: {
        // Marquee trust strip
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Counter number fade-in
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Pulse for live indicators
        'pulse-brand': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        // Slide up for cards
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade in
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      animation: {
        marquee:       'marquee 28s linear infinite',
        'count-up':    'count-up 0.5s ease-out forwards',
        'pulse-brand': 'pulse-brand 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in':     'fade-in 0.3s ease-out forwards',
      },

      // ─── Gradients (referenced as bg-[url/value]) ─────────────────────
      backgroundImage: {
        // Energy gradient: saffron → brand orange → brick red (CTA, arrow motif)
        'gradient-energy': 'linear-gradient(105deg, #F1D24A 0%, #E0731E 52%, #C03030 100%)',
        // EkoHaul gradient: teal → green → deep green
        'gradient-eko':    'linear-gradient(120deg, #119C97 0%, #138A4F 60%, #0F7242 100%)',
        // Subtle page hero wash
        'gradient-page':   'linear-gradient(180deg, #F6F6F4 0%, #FFFFFF 100%)',
        // Dark hero
        'gradient-dark-hero': 'linear-gradient(135deg, #131312 0%, #21211F 100%)',
      },
    },
  },
  plugins: [],
}

export default config
