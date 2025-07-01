// hooks/use-theme.ts - Исправленный хук темы
'use client'

import { useTheme as useNextTheme } from 'next-themes'

export const useTheme = () => {
  const { theme, setTheme, systemTheme } = useNextTheme()
  
  return {
    theme,
    setTheme,
    systemTheme,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    isLight: theme === 'light' || (theme === 'system' && systemTheme === 'light'),
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}