"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "@/app/theme/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";


export default function ThemeRegistry({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
        <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
        </AppRouterCacheProvider>
  );
}
