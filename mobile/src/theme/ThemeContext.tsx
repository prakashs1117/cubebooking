import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, ThemeColors } from './colors';
import { analytics } from '@services/analyticsService';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);

  // Load theme from storage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.warn('Error loading theme from storage:', error);
      }
    };

    loadTheme();
  }, []);

  // Save theme to storage whenever it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
      } catch (error) {
        console.warn('Error saving theme to storage:', error);
      }
    };

    saveTheme();
  }, [themeMode]);

  // Update status bar when theme changes
  useEffect(() => {
    const currentTheme = themeMode === 'dark' ? DarkTheme : LightTheme;
    StatusBar.setBarStyle(currentTheme.statusBar, true);
  }, [themeMode]);

  const theme = themeMode === 'dark' ? DarkTheme : LightTheme;
  const isDark = themeMode === 'dark';

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    // Log analytics for theme change
    try {
      analytics.logThemeChanged(newMode, false);
      analytics.setUserProperty('preferred_theme', newMode);
    } catch (error) {
      console.warn('Failed to log theme change:', error);
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    // Log analytics for theme set
    try {
      analytics.logThemeChanged(mode, false);
      analytics.setUserProperty('preferred_theme', mode);
    } catch (error) {
      console.warn('Failed to log theme set:', error);
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
