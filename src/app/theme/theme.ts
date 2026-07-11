import { createTheme, PaletteMode, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: {
      main: string;
      light: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    tertiary?: {
      main: string;
      light: string;
      dark: string;
    };
  }
}

const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
  primary: { main: "#2563EB", light: "#60A5FA", dark: "#1D4ED8" },
  secondary: { main: "#0EA5E9", light: "#38BDF8", dark: "#0284C7" },
  error: { main: "#DC2626", light: "#EF4444", dark: "#B91C1C" },
  warning: { main: "#F59E0B", light: "#FBBF24", dark: "#D97706" },
  info: { main: "#0EA5E9", light: "#38BDF8", dark: "#0284C7" },
  success: { main: "#16A34A", light: "#4ADE80", dark: "#15803D" },
  background: { default: "#F5F7FA", paper: "#ffffff" },
  text: { primary: "#1C2025", secondary: "#5C6B7D" },
  grey: {
    50: "#f8f9fa",
    100: "#f1f3f4",
    200: "#e8eaed",
    300: "#dadce0",
    400: "#bdc1c6",
    500: "#9aa0a6",
    600: "#80868b",
    700: "#5f6368",
    800: "#3c4043",
    900: "#202124",
  },
  tertiary: { main: "#8B5CF6", light: "#A78BFA", dark: "#7C3AED" },
};

const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: { main: "#3B82F6", light: "#60A5FA", dark: "#2563EB" },
  secondary: { main: "#38BDF8", light: "#7DD3FC", dark: "#0EA5E9" },
  error: { main: "#EF4444", light: "#F87171", dark: "#DC2626" },
  warning: { main: "#FBBF24", light: "#FCD34D", dark: "#F59E0B" },
  info: { main: "#38BDF8", light: "#7DD3FC", dark: "#0EA5E9" },
  success: { main: "#4ADE80", light: "#86EFAC", dark: "#16A34A" },
  background: { default: "#1A2333", paper: "#212B40" },
  text: { primary: "#E5E9F0", secondary: "#9AA4B8" },
  grey: {
    50: "#202124",
    100: "#3c4043",
    200: "#5f6368",
    300: "#80868b",
    400: "#9aa0a6",
    500: "#bdc1c6",
    600: "#dadce0",
    700: "#e8eaed",
    800: "#f1f3f4",
    900: "#f8f9fa",
  },
  tertiary: { main: "#A78BFA", light: "#C4B5FD", dark: "#8B5CF6" },
};

const buildThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: mode === "dark" ? darkPalette : lightPalette,
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.4 },
    subtitle1: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.4 },
    caption: { fontSize: "0.75rem", lineHeight: 1.3 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  spacing: 8,
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          fontFamily: "'Inter', sans-serif",
        },

        // Scrollbar styles...
        "*::-webkit-scrollbar": { width: "6px" },
        "*::-webkit-scrollbar-track": {
          background: theme.palette.mode === "dark" ? "#212B40" : "#f1f1f1",
        },
        "*::-webkit-scrollbar-thumb": {
          // matches the sidebar's own scrollbar thumb (M.scrollbarThumb)
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,.15)" : "#c1c1c1",
          borderRadius: "3px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,.25)" : "#a8a8a8",
        },

        // Autofill fix for all states
        "input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill, input:-webkit-autofill:hover, textarea:-webkit-autofill:hover, select:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill:focus, select:-webkit-autofill:focus, input:-webkit-autofill:active, textarea:-webkit-autofill:active, select:-webkit-autofill:active":
          {
            WebkitTextFillColor: `${theme.palette.text.primary} !important`,
            caretColor: theme.palette.text.primary,
            transition: "background-color 5000s ease-in-out 0s",
          },
      }),
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            borderColor: theme.palette.primary.dark,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(59, 130, 246, 0.12)"
                : "rgba(37, 99, 235, 0.04)",
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.08)",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,.08)" : "#E5E7EB"}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,.08)" : "#e0e0e0"}`,
          boxShadow: "none",
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.1)",
          borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,.08)" : "#E5E7EB"}`,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          marginBottom: 4,
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
          },
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,.06)" : "#f5f5f5",
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorError: ({ theme }) => ({
          backgroundColor: theme.palette.error.main,
          color: "#ffffff",
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: theme.palette.warning.main,
          color: "#ffffff",
        }),
        colorSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.success.main,
          color: "#ffffff",
        }),
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
        }),
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,.08)" : "#e0e0e0",
        }),
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        asterisk: {
          color: "red",
        },
        outlined: {
          top: "-4px",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            height: 48,
          },
          "& .MuiOutlinedInput-input": {
            padding: "10px 14px",
            height: "100%",
            boxSizing: "border-box",
          },
          "& .MuiInputLabel-root": {
            lineHeight: 1.2,
            top: "-2px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          height: 48,
        },
        select: {
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 800,
          color: theme.palette.text.primary,
        }),
      },
    },
  },
});

export const getTheme = (mode: PaletteMode = "light") =>
  createTheme(buildThemeOptions(mode));

export const theme = getTheme("light");

export default theme;
