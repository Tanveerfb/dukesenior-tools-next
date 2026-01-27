import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand colors matching the existing design system
const brandColors = {
  primary: '#ab2fb1',
  secondary: '#36453b',
  tertiary: '#515751',
  success: '#0f8029',
  warning: '#ffca3a',
  danger: '#a63a50',
  info: '#89608e',
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: '#c587cb',
      dark: '#7c307f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary,
      light: '#4d584f',
      dark: '#2e3933',
      contrastText: '#ffffff',
    },
    success: {
      main: brandColors.success,
      contrastText: '#ffffff',
    },
    warning: {
      main: brandColors.warning,
      contrastText: '#000000',
    },
    error: {
      main: brandColors.danger,
      contrastText: '#ffffff',
    },
    info: {
      main: brandColors.info,
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f7ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0c0909',
      secondary: '#515751',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(171, 47, 177, 0.15)',
        },
      },
    },
  },
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.primary,
      light: '#dbb5df',
      dark: '#672969',
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary,
      light: '#5f6d64',
      dark: '#27302b',
      contrastText: '#ffffff',
    },
    success: {
      main: brandColors.success,
      contrastText: '#ffffff',
    },
    warning: {
      main: brandColors.warning,
      contrastText: '#000000',
    },
    error: {
      main: brandColors.danger,
      contrastText: '#ffffff',
    },
    info: {
      main: brandColors.info,
      contrastText: '#ffffff',
    },
    background: {
      default: '#12130f',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#dcfffd',
      secondary: '#9fa9a3',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(171, 47, 177, 0.2)',
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export a function to get theme by mode
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
