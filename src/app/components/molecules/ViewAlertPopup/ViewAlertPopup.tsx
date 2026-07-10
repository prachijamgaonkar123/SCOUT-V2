"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
import { Close, CameraAlt } from "@mui/icons-material";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";

interface ViewAlertPopupProps<
  T extends Record<string, string | number | boolean | undefined>,
> {
  readonly open: boolean;
  readonly handleClose: () => void;
  readonly details?: T | null;
  readonly imageKey?: keyof T;
  readonly onDownload?: (imageUrl: string) => void;
}

function ViewAlertPopup<
  T extends Record<string, string | number | boolean | undefined>,
>({
  open,
  handleClose,
  details = {} as T,
  imageKey,
  onDownload,
}: ViewAlertPopupProps<T>) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageKey && details ? String(details[imageKey]) : "";

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleImageError = () => setImageError(true);

  const showPlaceholder = !imageUrl || imageUrl.trim() === "" || imageError;

  let dialogTitle = "Details";
  if (details) {
    if ("incident" in details) {
      dialogTitle = "Incident Details";
    } else if ("violation" in details) {
      dialogTitle = "Violation Details";
    } else if ("usage" in details) {
      dialogTitle = "Usage Details";
    }
  }

  const detailRows = details
    ? Object.entries(details).filter(([key]) => key !== String(imageKey))
    : [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "95%", sm: "70%" }, maxWidth: 700, borderRadius: "16px" },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          py: "16px",
          px: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
          {dialogTitle}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{ color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: "22px 24px" }}>
        {/* Snapshot preview */}
        <Box
          sx={{
            height: 380,
            borderRadius: "10px",
            overflow: "hidden",
            bgcolor: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            mb: "18px",
          }}
        >
          {showPlaceholder ? (
            <Box sx={{ textAlign: "center", color: "rgba(255,255,255,.5)" }}>
              <CameraAlt sx={{ fontSize: 40, mb: 1 }} />
              <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,.6)" }}>
                No Image Available
              </Typography>
            </Box>
          ) : (
            <Image
              src={imageUrl}
              alt="Alert"
              fill
              style={{ objectFit: "cover" }}
              unoptimized
              onError={handleImageError}
            />
          )}
        </Box>

        {/* Detail rows */}
        <Box>
          {detailRows.map(([key, value], index) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: "9px",
                borderBottom: index < detailRows.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <Typography sx={{ fontSize: "13.5px", color: "#6B7280", fontWeight: 500 }}>
                {key}
              </Typography>
              <Typography sx={{ fontSize: "13.5px", color: "#111827", fontWeight: 600 }}>
                {String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: "24px",
          py: "16px",
          borderTop: "1px solid #E5E7EB",
          bgcolor: "#FAFBFC",
          gap: "10px",
        }}
      >
        {onDownload && (
          <Button
            variant="outlined"
            startIcon={<DownloadForOfflineIcon />}
            onClick={() => onDownload(imageUrl)}
            sx={{ borderColor: "#E5E7EB", color: "#111827", textTransform: "none", fontWeight: 600 }}
          >
            Download
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ borderColor: "#E5E7EB", color: "#111827", textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewAlertPopup;
