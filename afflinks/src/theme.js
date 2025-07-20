
import { createTheme } from '@mui/material/styles';


const getAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#121212',
      light: '#1C2526',
      dark: '#000000',
      contrastText: '#F7E7CE',
    },
    secondary: {
      main: '#F7E7CE',
      light: '#FFF8E1',
      dark: '#E6D3B3',
      contrastText: '#121212',
    },
    background: {
      default: '#121212',
      paper: '#1C2526',
      accent: '#F7E7CE',
      brandMix: 'linear-gradient(120deg, #1C2526 60%, #F7E7CE 100%)',
      sourceMix: 'linear-gradient(120deg, #1C2526 60%, #FFF8E1 100%)',
    },
    text: {
      primary: '#FFF8E1',
      secondary: '#607D8B',
      contrast: '#121212',
    },
    gradient: 'linear-gradient(135deg, #121212 0%, #1C2526 100%)',
    champagne: '#F7E7CE',
    slate: '#607D8B',
    white: '#FFFFFF',
  },
  typography: {
    fontFamily: ['"Lora"', 'serif'].join(','),
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 800,
      fontSize: '3.5rem',
      letterSpacing: '-0.04em',
      color: '#F7E7CE',
      '@media (min-width:600px)': {
        fontSize: '4.5rem',
      },
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.03em',
      color: '#F7E7CE',
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2rem',
      color: '#F7E7CE',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
      color: '#121212',
      fontFamily: '"Lora", serif',
    },
    body1: {
      fontFamily: '"Lora", serif',
      fontWeight: 400,
      fontSize: '1.1rem',
      color: '#FFF8E1',
    },
    body2: {
      fontFamily: '"Lora", serif',
      fontWeight: 400,
      fontSize: '1rem',
      color: '#FFF8E1',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light'
            ? `linear-gradient(135deg, #121212 0%, #1C2526 100%)`
            : `linear-gradient(135deg, #121212 0%, #1C2526 100%)`, // Darker gradient for dark mode
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          '&:hover': {
          backgroundColor: '#1C2526',
          },
        },
        containedSecondary: {
          color: '#121212', // Ensure good contrast on amber
          '&:hover': {
            backgroundColor: '#F7E7CE',
          },
        },
        containedSuccess: {
          '&:hover': {
            backgroundColor: '#1C2526',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none', // Removed default underline
          '&:hover': {
            textDecoration: 'none', // Ensure no underline on hover
            // Add a custom hover effect like a subtle background or text color change
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: mode === 'light'
            ? `linear-gradient(180deg, #121212 0%, #1C2526 100%)`
            : `linear-gradient(180deg, #121212 0%, #1C2526 100%)`, // Darker gradient for dark mode
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  },
});

export default getAppTheme; // Export as a function
