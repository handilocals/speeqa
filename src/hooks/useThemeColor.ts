import { useTheme } from '../contexts/ThemeContext';
import { tokens } from '../theme/tokens';

type ColorScale = keyof typeof tokens.colors;
type ColorValue = keyof typeof tokens.colors.primary;

export function useThemeColor(scale: ColorScale, value: ColorValue = 500) {
  const { theme } = useTheme();
  return theme.colors[scale][value];
}

export function useThemeVariant<T extends keyof typeof tokens>(
  variantType: T,
  variantName: keyof typeof tokens[T]
) {
  const { theme } = useTheme();
  return tokens[variantType][variantName];
}

export function useThemeSpacing(size: keyof typeof tokens.spacing) {
  return tokens.spacing[size];
}

export function useThemeTypography(
  type: keyof typeof tokens.typography
) {
  return tokens.typography[type];
} 