"use client";
import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  useTheme,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Drawer,
  Popper,
} from "@mui/material";
import {
  Circle,
  ExitToApp,
  InfoOutlined,
  Menu as MenuIcon,
  // DarkMode,
  // LightMode,
} from "@mui/icons-material";
import { useAuth } from "../../../../customhooks/useAuth";
import {
  alertMenu,
  analyticsMenu,
  dashboardMenu,
  LinkMenuItem,

  MenuItemConfig,
  settingsMenu,
} from "@/app/config/menuConfig";
import { PageType } from "@/app/types";
import { usePathname } from "next/navigation";
import { useGetOrgAndUserLogoQuery } from "@/app/(protectedRoutes)/(settings)/(userManagement)/addUser/AddUserApi";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
// import { toggleThemeMode } from "@/app/store/slices/themeSlice";
import {
  HEADER_HEIGHT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_RAIL,
} from "@/app/config/layoutConstants";

interface SystemHealthData {
  message: string[];
  lastChecked: string;
}

const SystemHealthTooltipContent: React.FC<{
  systemHealth: SystemHealthData;
}> = ({ systemHealth }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={8}
      sx={{
        minWidth: 260,
        maxWidth: 300,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "#e0e0e0"}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          px: 2.5,
          py: 2,
          maxHeight: 180,
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: isDark ? "#212B40" : "#f5f5f5",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "rgba(255,255,255,.15)" : "#c0c0c0",
            borderRadius: "2px",
          },
        }}
      >
        {systemHealth.message.slice(0, 8).map((msg, idx) => (
          <Typography
            key={uuidv4() + idx}
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontSize: "13px",
              lineHeight: 1.5,
              mb: 1,
              "&:last-child": { mb: 0 },
            }}
          >
            • {msg}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          backgroundColor: isDark ? "#1A2333" : "#f8f9fa",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "#e9ecef"}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <InfoOutlined sx={{ fontSize: 12 }} />
          Last updated: {systemHealth.lastChecked}
        </Typography>
      </Box>
    </Paper>
  );
};

interface HeaderProps {
  /** Mirrors the Sidebar's collapsed/rail state so the header can shrink
   *  its left offset/width to match instead of leaving a gap or overlap. */
  collapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ collapsed = false }) => {
  const theme = useTheme();
  // const dispatch = useDispatch();
  // const themeMode = useSelector((state: RootState) => state.theme.mode);
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_RAIL : SIDEBAR_WIDTH;
  const { isLoading, logout } = useAuth();
  const { user } = useSelector((state: RootState) => state.auth);

  const tenantId: string = user?.org_id ?? "";
  const LoggedInUser: string = user?.userId ?? "oo";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState<PageType>(
    "safety-compliance-dashboard",
  );
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [anchorElHealth, setAnchorElHealth] = useState<null | HTMLElement>(
    null,
  );
  const [openHealth, setOpenHealth] = useState(false);
  const healthTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data } = useGetOrgAndUserLogoQuery(
    {
      LoggedInUserId: LoggedInUser,
      tenantId: tenantId,
    },
    {
      skip: !LoggedInUser || !tenantId,
    },
  );
  // Fallback image if API fails or loading

  const handleHealthMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (healthTimerRef.current) clearTimeout(healthTimerRef.current);
    setAnchorElHealth(event.currentTarget);
    setOpenHealth(true);
  };

  const handleHealthMouseLeave = () => {
    healthTimerRef.current = setTimeout(() => {
      setOpenHealth(false);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (healthTimerRef.current) {
      clearTimeout(healthTimerRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    setOpenHealth(false);
  };

  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  const [systemHealth, setSystemHealth] = useState<SystemHealthData>({
    message: [
      "All systems operational",
      "Database running smoothly",
      "API response time normal",
      "No critical alerts",
      "Camera feeds: 24/24 online",
      "Motion detection active",
      "Storage capacity: 65%",
      "Network connectivity stable",
    ],
    lastChecked: new Date().toLocaleTimeString(),
  });


const pageTitleMap: Record<string, string> = {
  "/AddUser": "Add User",
  "/EditUser": "Edit User",
  "/UserOverview":"User Overview",
  "/ViewUser":"View User",
   "/AddRole": "Add Role",
  "/EditRole": "Edit Role",
  "/RoleOverview":"Role Overview",
  "/ViewRole":"View Role"
};


const getPageTitle = () => {
  const flattenMenuItems = (menu: MenuItemConfig[]): LinkMenuItem[] => {
    return menu.flatMap((item) => {
      if (item.type === "link") return [item];
      if (item.type === "group") return flattenMenuItems(item.items);
      return [];
    });
  };

  const allMenuItems: LinkMenuItem[] = [
    // ...flattenMenuItems(liveStreamingMenu),
    ...dashboardMenu.flatMap((c) => flattenMenuItems(c.items)),
    ...flattenMenuItems(alertMenu),
    ...analyticsMenu.flatMap((c) => flattenMenuItems(c.items)),
    ...settingsMenu.flatMap((c) => flattenMenuItems(c.items)),
  ];

  const currentItem = allMenuItems.find(
    (item) => pathname.toLowerCase().startsWith(item.path.toLowerCase())
  );

  if (currentItem) return currentItem.name;

  // fallback to pageTitleMap
  for (const basePath in pageTitleMap) {
    if (pathname.toLowerCase().startsWith(basePath.toLowerCase())) {
      return pageTitleMap[basePath];
    }
  }

  return "Dashboard";
};
  useEffect(() => {
    const allMenuItems = [
      // ...liveStreamingMenu,
      ...dashboardMenu.flatMap((c) => c.items),
      ...alertMenu,
      ...analyticsMenu.flatMap((c) => c.items),
      ...settingsMenu.flatMap((c) => c.items),
    ];

    const currentItem = allMenuItems.find(
      (item): item is LinkMenuItem =>
        item.type === "link" &&
        item.path.toLowerCase() === pathname.toLowerCase(),
    );
    setCurrentPage(
      currentItem ? currentItem.page! : "safety-compliance-dashboard",
    );
  }, [pathname]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
  };

  useEffect(() => {
    const updateTime = () => {
      setCurrentDateTime(
        new Date().toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
      setSystemHealth((prev: SystemHealthData) => ({
        ...prev,
        lastChecked: new Date().toLocaleTimeString(),
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (healthTimerRef.current) {
        clearTimeout(healthTimerRef.current);
      }
    };
  }, []);

  return (

      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          height: HEADER_HEIGHT,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.1)",
          left: { xs: 0, lg: `${sidebarWidth}px` },
          width: { xs: "100%", lg: `calc(100% - ${sidebarWidth}px)` },
          transition: "left .2s ease, width .2s ease, background-color .2s ease, color .2s ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: 3 }}>
          {/* Left side: menu toggle for mobile + page title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              sx={{ display: { xs: "inline-flex", lg: "none" } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                fontSize: "16px",
                pl: 1.2,
              }}
            >
              {getPageTitle()}
            </Typography>
          </Box>

          {/* Right side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {currentDateTime && (
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "12px" }}
              >
                {currentDateTime}
              </Typography>
            )}

            {/* Theme toggle */}
            {/* <IconButton
              onClick={() => dispatch(toggleThemeMode())}
              size="small"
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              sx={{ color: theme.palette.text.secondary }}
            >
              {themeMode === "dark" ? (
                <LightMode sx={{ fontSize: 20 }} />
              ) : (
                <DarkMode sx={{ fontSize: 20 }} />
              )}
            </IconButton> */}

            {/* System Health Section with hover */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "default",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
              }}
              onMouseEnter={handleHealthMouseEnter}
              onMouseLeave={handleHealthMouseLeave}
            >
              <Circle
                sx={{
                  fontSize: 8,
                  color: "#4caf50",
                  filter: "drop-shadow(0 0 2px rgba(76, 175, 80, 0.3))",
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "12px", fontWeight: 500 }}
              >
                System Health
              </Typography>
            </Box>

            {user && (
              <>
                {!isLoading && user && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleClick} size="small">
                      {/* <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#3072b0",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {userLogo ?? user.userName?.charAt(0).toUpperCase() ?? "?"}
                      </Avatar> */}
                      <Avatar
                        src={data?.logoPath?.userLogo || undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "#3072b0",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {!data?.logoPath?.userLogo &&
                          (user.userName?.charAt(0).toUpperCase() ?? "?")}
                      </Avatar>
                    </IconButton>
                  </Box>
                )}

                <Popper
                  open={openHealth}
                  anchorEl={anchorElHealth}
                  placement="bottom-end"
                  disablePortal={false}
                  sx={{
                    zIndex: 2000,
                    mt: 1,
                  }}
                  modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
                >
                  <Box
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                  >
                    <SystemHealthTooltipContent systemHealth={systemHealth} />
                  </Box>
                </Popper>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  disableScrollLock
                  sx={{ mt: "15px" }}
                >
                  {/* User Info at top */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,.08)" : "#e0e0e0"}`,
                    }}
                  >
                    {user.userName && (
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                      >
                        {user.userName}
                      </Typography>
                    )}
                    {user.role && (
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}
                      >
                        Role: {user.role.toLowerCase().replaceAll(/[-_]/g, " ")}

                      </Typography>
                    )}
                  </Box>

                  {/* Logout Button */}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToApp fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

    
  );
};

export default Header;
