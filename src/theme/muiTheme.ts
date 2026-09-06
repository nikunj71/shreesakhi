'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

export function getShreeSakhiMuiTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#084C42', // Deep Royal Peacock Teal from Logo
        light: '#0E6E60',
        dark: '#04322B',
        contrastText: '#FAF6EC',
      },
      secondary: {
        main: '#DFBD76', // Warm Royal Gold from Logo
        light: '#F5EFE1', // Soft Ivory Cream from Logo
        dark: '#B89343',
        contrastText: '#04322B',
      },
      background: {
        default: isDark ? '#041A17' : '#F7F4EE', // Obsidian Teal or Silk Ivory
        paper: isDark ? '#072622' : '#FFFFFF',   // Midnight Emerald Slate or Pure White
      },
      text: {
        primary: isDark ? '#FAF6EC' : '#062A24',
        secondary: isDark ? '#9BB5AF' : '#4A605B',
      },
      divider: isDark ? 'rgba(223, 189, 118, 0.16)' : 'rgba(8, 76, 66, 0.12)',
    },
    typography: {
      fontFamily: "var(--font-dm-sans), 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      h1: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 700,
      },
      h4: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 700,
      },
      h5: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 600,
      },
      h6: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 600,
      },
      subtitle1: {
        fontFamily: "var(--font-syne), 'Syne', sans-serif",
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      button: {
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999,
            padding: '8px 20px',
            fontSize: '0.8125rem',
            boxShadow: 'none',
            textTransform: 'none',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: isDark
              ? '0 2px 8px 0 rgba(0, 0, 0, 0.4)'
              : '0 2px 8px 0 rgba(114, 28, 36, 0.15)',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 14px 0 rgba(197, 160, 89, 0.25)'
                : '0 4px 14px 0 rgba(114, 28, 36, 0.2)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(197, 160, 89, 0.3)' : '#EADFC9',
            '&:hover': {
              borderColor: '#C5A059',
              backgroundColor: isDark ? 'rgba(197, 160, 89, 0.08)' : 'rgba(197, 160, 89, 0.06)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#072622' : '#FFFFFF',
            border: isDark ? '1px solid rgba(223, 189, 118, 0.2)' : '1px solid rgba(8, 76, 66, 0.12)',
            boxShadow: isDark
              ? '0 10px 30px -5px rgba(0, 0, 0, 0.6)'
              : '0 10px 30px -5px rgba(8, 76, 66, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 16px 36px -4px rgba(0, 0, 0, 0.8)'
                : '0 16px 36px -4px rgba(8, 76, 66, 0.15)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(223, 189, 118, 0.25)' : '1px solid rgba(8, 76, 66, 0.15)',
            backgroundColor: isDark ? '#072622' : '#FFFFFF',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(4, 26, 23, 0.94)' : 'rgba(247, 244, 238, 0.94)',
            backdropFilter: 'blur(16px)',
            borderBottom: isDark ? '1px solid rgba(223, 189, 118, 0.18)' : '1px solid rgba(8, 76, 66, 0.12)',
            boxShadow: 'none',
            color: isDark ? '#FAF6EC' : '#062A24',
          },
        },
      },
      MuiPickerPopper: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#072622' : '#FFFFFF',
            border: isDark ? '1px solid rgba(223, 189, 118, 0.3)' : '1px solid rgba(8, 76, 66, 0.15)',
            boxShadow: isDark
              ? '0 20px 40px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(223, 189, 118, 0.2)'
              : '0 20px 40px -8px rgba(8, 76, 66, 0.15)',
            borderRadius: 20,
            color: isDark ? '#FAF6EC' : '#062A24',
          },
        },
      },
      MuiPickerDay: {
        styleOverrides: {
          root: {
            color: isDark ? '#FAF6EC' : '#062A24',
            borderRadius: 12,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(223, 189, 118, 0.2)' : 'rgba(8, 76, 66, 0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: '#DFBD76 !important',
              color: '#041A17 !important',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: '#C5A059 !important',
              },
            },
            '&.MuiPickersDay-today': {
              borderColor: '#DFBD76',
            },
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          root: {
            color: isDark ? '#FAF6EC' : '#062A24',
          },
          switchViewButton: {
            color: isDark ? '#DFBD76' : '#084C42',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
