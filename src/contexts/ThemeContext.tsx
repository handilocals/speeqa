import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens } from '../theme/tokens';
import { getColors } from '../theme/colors';

export type ThemeType = 'light' | 'dark' | 'system';

interface Theme {
  colors: ReturnType<typeof getColors>;
  spacing: typeof tokens.spacing;
  typography: typeof tokens.typography;
  borderRadius: typeof tokens.borderRadius;
  shadows: typeof tokens.shadows;
  animations: typeof tokens.animations;
  zIndex: typeof tokens.zIndex;
  opacity: typeof tokens.opacity;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: {
    colors: getColors(false),
    spacing: tokens.spacing,
    typography: tokens.typography,
    borderRadius: tokens.borderRadius,
    shadows: tokens.shadows,
    animations: tokens.animations,
    zIndex: tokens.zIndex,
    opacity: tokens.opacity,
    isDark: false,
  },
  themeType: 'system',
  setThemeType: () => {},
  isDark: false,
  isTransitioning: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [isDark, setIsDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('theme', themeType);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [themeType]);

  useEffect(() => {
    const newIsDark = themeType === 'system'
      ? systemColorScheme === 'dark'
      : themeType === 'dark';

    if (newIsDark !== isDark) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsDark(newIsDark);
        setIsTransitioning(false);
      }, tokens.animations.duration.normal);
    }
  }, [themeType, systemColorScheme]);

  const theme: Theme = {
    colors: getColors(isDark),
    spacing: tokens.spacing,
    typography: tokens.typography,
    borderRadius: tokens.borderRadius,
    shadows: tokens.shadows,
    animations: tokens.animations,
    zIndex: tokens.zIndex,
    opacity: tokens.opacity,
    isDark,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        setThemeType,
        isDark,
        isTransitioning,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};