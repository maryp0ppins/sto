// components/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

// Use ComponentProps instead of importing from next-themes/dist/types
interface CustomThemeProviderProps extends Omit<ComponentProps<typeof NextThemesProvider>, 'children'> {
  children: React.ReactNode
}

export function ThemeProvider({ 
  children, 
  ...props 
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}