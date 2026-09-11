"use client";
import { ReactNode, useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";
import { usePathname } from "next/navigation";
import Sidebar from "../components/organisms/Sidebar/Sidebar";
import Header from "../components/organisms/Header/Header";
import { PageType } from "@/app/types";
import { dashboardMenu, alertMenu, analyticsMenu } from "../config/menuConfig";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FeatureGuardProvider } from "@/Providers/globalFeatureflagProvider";
import Loader from "../components/atoms/Loader/Loader";
import AuthGuard from "@/utils/auth-guard";
import PageTransitionWrapper from "@/customhooks/PageTransitionWrapper";
import { HEADER_HEIGHT } from "../config/layoutConstants";
import { AlertsProvider, useAlerts } from "@/Providers/AlertsProvider";
import RecentEventPopup from "../components/molecules/AlertPopup/RecentEventPopup";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({
  children,
}: Readonly<ClientLayoutProps>) {
  return (
    <AlertsProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </AlertsProvider>
  );
}

function ClientLayoutContent({ children }: Readonly<ClientLayoutProps>) {
  const pathname = usePathname();
  const { popupEvents, isPopupSnoozed, handlePopupStatusChange, handleSnoozePopup } =
    useAlerts();

  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebartheme = useTheme();
  const isTabletOrPhone = useMediaQuery(
    sidebartheme.breakpoints.down("lg"),
    {},
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const allMenuItems = [
      // flatten Dashboard menu (each category’s items)
      ...dashboardMenu.flatMap((category) => category.items),
      ...alertMenu,
      ...analyticsMenu.flatMap((category) => category.items),
    ];

    const currentItem = allMenuItems.find(
      (item) => pathname && item.path?.toLowerCase() === pathname.toLowerCase(),
    );

    setCurrentPage(currentItem ? currentItem.page! : "dashboard");
  }, [pathname]);

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    console.log("Navigating to:", page);
  };

  if (!mounted) {
    return <Loader />;
  }

  return (
    <AuthGuard>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Header collapsed={sidebarCollapsed} />

        <Sidebar onCollapsedChange={setSidebarCollapsed} />

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex", // Add flexbox
            flexDirection: "column", // Stack children vertically
            pl: 2.5,
            pr: 2.5,
            pb: 2,
            pt: `${HEADER_HEIGHT + 16}px`,
            backgroundColor: sidebartheme.palette.background.default,
            overflow: "auto",
            minHeight: 0,
          }}
        >
          {/* Caps content width on very large / ultra-wide monitors so it
              doesn't stretch edge-to-edge; below "xl" (i.e. on Mac screens)
              this is a no-op — width stays 100% as before. */}
          <Box
            sx={{
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              [sidebartheme.breakpoints.up("xl")]: {
                maxWidth: "1800px",
                marginX: "auto",
              },
            }}
          >
            <FeatureGuardProvider>
              <PageTransitionWrapper>{children}</PageTransitionWrapper>
            </FeatureGuardProvider>
          </Box>
        </Box>
      </Box>

      {popupEvents.length > 0 && !isPopupSnoozed && (
        <RecentEventPopup
          events={popupEvents}
          totalCount={popupEvents.length}
          onStatusChange={handlePopupStatusChange}
          onSnooze={handleSnoozePopup}
        />
      )}
    </LocalizationProvider>
    </AuthGuard>
  );
}
