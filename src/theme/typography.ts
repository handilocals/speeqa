export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographyScale = keyof typeof typography;
export type FontSizeScale = keyof typeof typography.fontSizes;
export type FontWeightScale = keyof typeof typography.fontWeights;
export type LineHeightScale = keyof typeof typography.lineHeights; 