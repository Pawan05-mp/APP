export const Theme = {
  dark: {
    background: {
      primary: '#0A0A0A',
      secondary: '#151515',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
    },
    border: '#2A2A2A',
    accentWhite: '#F8F8F8',
  },
  light: {
    background: {
      primary: '#FAFAF5',
      secondary: '#F1F5E8',
    },
    text: {
      primary: '#111111',
      secondary: '#666666',
    },
    border: '#D9E3C2',
    surfaceHighlight: '#F7FFD6',
  },
  brand: {
    hero: '#C8E81E', // Lime Green
    deep: '#39B81F', // Deep Fresh Green
    soft: '#E7FF73', // Soft Glow Green
    yellow: '#FFD84D', // Warm Accent Yellow
    coral: '#FF6B57', // Soft Alert Coral
    black: '#111111', // Trust Black
  },
};

export const Colors = {
  ...Theme.brand,
  // Defaulting to Dark Mode as it's the premium focus
  background: Theme.dark.background.primary,
  surface: Theme.dark.background.secondary,
  text: Theme.dark.text.primary,
  textSecondary: Theme.dark.text.secondary,
  border: Theme.dark.border,
};
