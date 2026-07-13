"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import {
  Close,
  VideocamOutlined,
  VideocamOffOutlined,
  GppMaybeOutlined,
} from "@mui/icons-material";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

export type CameraStatus = "online" | "offline" | "tampered";

export interface CameraListItem {
  id: string;
  zone: string;
  status: CameraStatus;
}

export interface CameraSection {
  label: string;
  status: CameraStatus;
  cameras: CameraListItem[];
}

interface CameraOnlineOfflinePopUpProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly sections: CameraSection[];
}

const STATUS_STYLES: Record<CameraStatus, { icon: typeof VideocamOutlined; color: string; label: string }> = {
  online: { icon: VideocamOutlined, color: DASHBOARD_COLORS.success, label: "Online" },
  offline: { icon: VideocamOffOutlined, color: DASHBOARD_COLORS.error, label: "Offline" },
  tampered: { icon: GppMaybeOutlined, color: DASHBOARD_COLORS.warningText, label: "Tampered" },
};

const CameraOnlineOfflinePopUp: React.FC<CameraOnlineOfflinePopUpProps> = ({
  open,
  onClose,
  title,
  sections,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "95%", sm: "70%" }, maxWidth: 640, borderRadius: "16px" },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          py: "16px",
          px: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: DASHBOARD_COLORS.textSecondary }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, maxHeight: 420 }}>
        {sections.map((section) => (
          <Box key={section.label}>
            {sections.length > 1 && (
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: DASHBOARD_COLORS.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  padding: "14px 24px 6px 24px",
                }}
              >
                {section.label} ({section.cameras.length})
              </Typography>
            )}

            {section.cameras.length === 0 ? (
              <Typography sx={{ fontSize: "13.5px", color: DASHBOARD_COLORS.textSecondary, padding: "8px 24px 16px 24px" }}>
                No cameras {section.label.toLowerCase()}.
              </Typography>
            ) : (
              section.cameras.map((camera, index) => {
                const { icon: Icon, color, label } = STATUS_STYLES[camera.status];
                return (
                  <Box
                    key={camera.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 24px",
                      borderBottom:
                        index < section.cameras.length - 1 ? `1px solid ${DASHBOARD_COLORS.border}` : "none",
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
                        {camera.id}
                        <Typography
                          component="span"
                          sx={{ fontSize: "13px", fontWeight: 500, color: DASHBOARD_COLORS.textSecondary }}
                        >
                          {" "}· {camera.zone}
                        </Typography>
                      </Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color }}>{label}</Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        ))}
      </DialogContent>

      <DialogActions
        sx={{
          px: "24px",
          py: "16px",
          borderTop: `1px solid ${DASHBOARD_COLORS.border}`,
          bgcolor: DASHBOARD_COLORS.bg,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderColor: DASHBOARD_COLORS.border, color: DASHBOARD_COLORS.textPrimary, textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraOnlineOfflinePopUp;
