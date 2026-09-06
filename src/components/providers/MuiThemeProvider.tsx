'use client';

import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector } from '@/store/hooks';
import { getShreeSakhiMuiTheme } from '@/theme/muiTheme';

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((state) => state.auth.theme);

  const muiTheme = useMemo(() => {
    return getShreeSakhiMuiTheme(themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
