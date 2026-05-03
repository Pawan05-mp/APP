/**
 * TRIXILE DESIGN SYSTEM TOKENS v1.0
 * Production-level discipline. Scalable. Premium.
 */

export const Typography = {
  families: {
    heading: 'ClanPro-Bold',
    ui: 'ClanPro-Regular',
    uiMedium: 'ClanPro-Medium',
    uiBold: 'ClanPro-Bold',
  },
  display: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -1,
    fontWeight: '800',
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '700',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: '400',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  ultra: 64,
};

export const Radius = {
  small: 8,
  medium: 12,
  large: 20,
  xl: 28,
  pill: 999,
};

export const Palette = {
  // Primary Green (Hero) - Energetic but Premium
  primary: {
    50: '#F9FDE6',
    100: '#F1F9C1',
    200: '#E2F284',
    300: '#C8E81E', // CORE HERO GREEN
    400: '#B2D11A',
    500: '#9AB515',
    600: '#7B9111',
    700: '#5D6E0D',
    800: '#404C09',
    900: '#232905',
  },
  // Grayscale (Neutral)
  neutral: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#0A0A0A', // CORE DARK BACKGROUND
  },
  // Semantics
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  coral: '#FF4D67', // Interaction secondary
};

export const Shadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  brand: {
    shadowColor: Palette.primary[300],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

/**
 * THEME DEFINITIONS
 */
export const Themes = {
  light: {
    mode: 'light',
    colors: {
      background: Palette.neutral[50],
      surface: '#FFFFFF',
      surfaceSecondary: Palette.neutral[100],
      border: Palette.neutral[200],
      textPrimary: Palette.neutral[900],
      textSecondary: Palette.neutral[500],
      hero: Palette.primary[300],
      heroContrast: Palette.neutral[900],
      accent: Palette.coral,
      overlay: 'rgba(10, 10, 10, 0.05)',
    },
    shadow: Shadow.light,
  },
  dark: {
    mode: 'dark',
    colors: {
      background: Palette.neutral[900],
      surface: '#121212',
      surfaceSecondary: '#1A1A1A',
      border: 'rgba(255, 255, 255, 0.08)',
      textPrimary: '#FFFFFF',
      textSecondary: Palette.neutral[400],
      hero: Palette.primary[300],
      heroContrast: Palette.neutral[900],
      accent: Palette.coral,
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    shadow: Shadow.medium,
  },
};

/**
 * COMPONENT STANDARDS
 */
export const Components = {
  button: {
    height: 54,
    radius: Radius.large,
    padding: Spacing.l,
    primary: {
      backgroundColor: Palette.primary[300],
      textColor: Palette.neutral[900],
    },
    secondary: {
      backgroundColor: Palette.neutral[800],
      textColor: '#FFFFFF',
    },
    disabled: {
      backgroundColor: Palette.neutral[200],
      textColor: Palette.neutral[400],
    },
  },
  card: {
    radius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  input: {
    height: 58,
    radius: Radius.medium,
    padding: Spacing.l,
    borderWidth: 1.5,
  },
};
