import { tokens } from './tokens';

export const variants = {
  buttons: {
    primary: {
      backgroundColor: tokens.colors.primary[500],
      color: tokens.colors.neutral[50],
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      ...tokens.shadows.sm,
    },
    secondary: {
      backgroundColor: tokens.colors.secondary[500],
      color: tokens.colors.neutral[50],
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      ...tokens.shadows.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: tokens.colors.primary[500],
      color: tokens.colors.primary[500],
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
    },
    text: {
      backgroundColor: 'transparent',
      color: tokens.colors.primary[500],
      paddingVertical: tokens.spacing.xs,
      paddingHorizontal: tokens.spacing.sm,
    },
  },
  inputs: {
    default: {
      backgroundColor: tokens.colors.neutral[50],
      borderWidth: 1,
      borderColor: tokens.colors.neutral[300],
      borderRadius: tokens.borderRadius.md,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      color: tokens.colors.neutral[900],
    },
    focused: {
      borderColor: tokens.colors.primary[500],
      ...tokens.shadows.sm,
    },
    error: {
      borderColor: tokens.colors.error[500],
    },
  },
  cards: {
    default: {
      backgroundColor: tokens.colors.neutral[50],
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing.md,
      ...tokens.shadows.md,
    },
    elevated: {
      backgroundColor: tokens.colors.neutral[50],
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing.md,
      ...tokens.shadows.lg,
    },
  },
  typography: {
    h1: {
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      color: tokens.colors.neutral[900],
    },
    h2: {
      fontSize: tokens.typography.fontSize['3xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      color: tokens.colors.neutral[900],
    },
    h3: {
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.tight,
      color: tokens.colors.neutral[900],
    },
    body: {
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.regular,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.neutral[700],
    },
    caption: {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.regular,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.neutral[500],
    },
  },
} as const;

export type ThemeVariants = typeof variants; 