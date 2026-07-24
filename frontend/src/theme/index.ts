import { createTheme } from '@mui/material/styles';

// Clinical, high-contrast palette suited for reading rooms and long shifts.
// Deep blue primary (trust/clinical), teal accent, restrained greys.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0B5394', light: '#3D7CB8', dark: '#073A66', contrastText: '#FFFFFF' },
    secondary: { main: '#00897B', light: '#4EBAAA', dark: '#005B4F' },
    error: { main: '#C62828' },
    warning: { main: '#EF6C00' },
    success: { main: '#2E7D32' },
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
    text: { primary: '#1A2027', secondary: '#5A6472' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: '#0B5394' } },
    },
    MuiButton: {
      styleOverrides: { root: { boxShadow: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

export default theme;
