// 🎨 Tokens de design pour CandiVoc - Design System (alignés avec Tailwind)
export const designTokens = {
  // 🎯 Couleurs primaires (alignées avec tailwind.config.js)
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    }
  },

  // 📝 Typographie
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // 📏 Espacement
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  // 🎭 Ombres
  boxShadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },

  // 🔄 Bordures et rayons
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  borderWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },

  // 🎨 Animations et transitions
  animation: {
    none: 'none',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    wiggle: 'wiggle 1s ease-in-out infinite',
    slideIn: 'slideIn 0.3s ease-out',
    slideOut: 'slideOut 0.3s ease-in',
    fadeIn: 'fadeIn 0.3s ease-in',
    fadeOut: 'fadeOut 0.3s ease-out'
  },
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // 📐 Grilles et breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px'
    }
  },

  // 🎯 Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // 🌈 Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #13B497 0%, #59D4A4 100%)',
    warning: 'linear-gradient(135deg, #FA8231 0%, #FD79A8 100%)',
    error: 'linear-gradient(135deg, #EB5757 0%, #F2994A 100%)',
    dark: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
    light: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)'
  },

  // 📱 Composants spécifiques
  components: {
    button: {
      padding: {
        xs: '0.5rem 1rem',
        sm: '0.75rem 1.5rem',
        md: '0.875rem 2rem',
        lg: '1rem 2.5rem',
        xl: '1.25rem 3rem'
      },
      fontSize: {
        xs: '0.875rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      borderRadius: '0.5rem',
      fontWeight: '500',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    card: {
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb'
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modal: {
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      backgroundColor: 'white',
      maxWidth: '90vw',
      maxHeight: '90vh'
    }
  }
}

// 🎨 Thèmes prédéfinis
export const themes = {
  light: {
    colors: {
      background: designTokens.colors.neutral[50],
      foreground: designTokens.colors.neutral[900],
      primary: designTokens.colors.primary[600],
      'primary-foreground': designTokens.colors.neutral[50],
      secondary: designTokens.colors.secondary[100],
      'secondary-foreground': designTokens.colors.secondary[900],
      muted: designTokens.colors.secondary[100],
      'muted-foreground': designTokens.colors.secondary[500],
      accent: designTokens.colors.primary[100],
      'accent-foreground': designTokens.colors.primary[900],
      destructive: designTokens.colors.error[500],
      'destructive-foreground': designTokens.colors.neutral[50],
      border: designTokens.colors.secondary[200],
      input: designTokens.colors.secondary[100],
      ring: designTokens.colors.primary[500],
      card: designTokens.colors.neutral[50],
      'card-foreground': designTokens.colors.neutral[900],
      popover: designTokens.colors.neutral[50],
      'popover-foreground': designTokens.colors.neutral[900]
    }
  },
  dark: {
    colors: {
      background: designTokens.colors.neutral[900],
      foreground: designTokens.colors.neutral[100],
      primary: designTokens.colors.primary[500],
      'primary-foreground': designTokens.colors.neutral[900],
      secondary: designTokens.colors.secondary[800],
      'secondary-foreground': designTokens.colors.secondary[100],
      muted: designTokens.colors.secondary[700],
      'muted-foreground': designTokens.colors.secondary[300],
      accent: designTokens.colors.primary[900],
      'accent-foreground': designTokens.colors.primary[100],
      destructive: designTokens.colors.error[500],
      'destructive-foreground': designTokens.colors.neutral[100],
      border: designTokens.colors.secondary[700],
      input: designTokens.colors.secondary[800],
      ring: designTokens.colors.primary[400],
      card: designTokens.colors.secondary[900],
      'card-foreground': designTokens.colors.neutral[100],
      popover: designTokens.colors.secondary[900],
      'popover-foreground': designTokens.colors.neutral[100]
    }
  },
  professional: {
    colors: {
      background: designTokens.colors.neutral[50],
      foreground: designTokens.colors.secondary[900],
      primary: designTokens.colors.secondary[700],
      'primary-foreground': designTokens.colors.neutral[50],
      secondary: designTokens.colors.neutral[100],
      'secondary-foreground': designTokens.colors.secondary[900],
      muted: designTokens.colors.neutral[200],
      'muted-foreground': designTokens.colors.secondary[600],
      accent: designTokens.colors.primary[100],
      'accent-foreground': designTokens.colors.primary[800],
      destructive: designTokens.colors.error[600],
      'destructive-foreground': designTokens.colors.neutral[50],
      border: designTokens.colors.neutral[300],
      input: designTokens.colors.neutral[100],
      ring: designTokens.colors.secondary[600],
      card: designTokens.colors.neutral[50],
      'card-foreground': designTokens.colors.secondary[900],
      popover: designTokens.colors.neutral[50],
      'popover-foreground': designTokens.colors.secondary[900]
    }
  }
}

// 🎯 Types pour le thème
export type Theme = typeof themes.light
export type ThemeName = keyof typeof themes

// 🎨 Hook pour utiliser les tokens
export function useDesignTokens() {
  return {
    tokens: designTokens,
    themes
  }
}