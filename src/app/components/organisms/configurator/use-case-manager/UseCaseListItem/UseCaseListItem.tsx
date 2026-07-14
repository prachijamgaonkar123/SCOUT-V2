"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { UseCase } from "@/app/types/useCaseManager";

interface UseCaseListItemProps {
  useCase: UseCase;
  assignedCameraCount: number;
  onConfigureCameras: (useCase: UseCase) => void;
}

export const UseCaseListItem: React.FC<UseCaseListItemProps> = ({
  useCase,
  assignedCameraCount,
  onConfigureCameras,
}) => {
  const hasCamera = assignedCameraCount > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 1.5,
        border: "1px solid",
        borderColor: hasCamera ? "success.light" : "divider",
        transition: "all 0.2s ease",
        backgroundColor: "white",
        "&:hover": {
          boxShadow: 2,
          borderColor: hasCamera ? "success.main" : "primary.light",
          backgroundColor: "grey.50",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* Use Case Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Use Case Name */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.05rem",
              lineHeight: 1.3,
              mb: 0.5,
              color: "text.primary",
            }}
          >
            {useCase.name}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {useCase.description}
          </Typography>
        </Box>

        {/* Camera Status & Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: { xs: "row", sm: "row" },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "space-between", md: "flex-end" },
            mt: { xs: 2, md: 0 },
            pt: { xs: 2, md: 0 },
            borderTop: { xs: "1px solid", md: "none" },
            borderColor: { xs: "divider", md: "transparent" },
          }}
        >
          {/* Camera Count */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1,
              backgroundColor: "white",
              border: "1px solid",
              borderColor: hasCamera ? "success.main" : "divider",
              minWidth: 140,
              height: 42, // Match button height
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                color: hasCamera ? "success.dark" : "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                }}
              >
                {assignedCameraCount}
              </Box>
              <Box component="span" sx={{ fontSize: "0.875rem" }}>
                {assignedCameraCount === 1 ? "Camera" : "Cameras"}
              </Box>
            </Typography>
            <Box sx={{ ml: "auto" }}>
              {hasCamera ? (
                <CheckCircleIcon
                  sx={{
                    fontSize: 20,
                    color: "success.main",
                  }}
                />
              ) : (
                <WarningIcon
                  sx={{
                    fontSize: 20,
                    color: "warning.main",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Configure Button */}
          <Button
            variant={hasCamera ? "outlined" : "contained"}
            color="primary"
            startIcon={<SettingsIcon />}
            endIcon={<ChevronRightIcon />}
            onClick={() => onConfigureCameras(useCase)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              minWidth: 160,
              px: 2.5,
            }}
          >
            {hasCamera ? "Manage" : "Configure"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
