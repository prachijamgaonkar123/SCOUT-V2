"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  
} from "@mui/material";
import { Close } from "@mui/icons-material";
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
  const [loading, setLoading] = useState(false); // ← local loader

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
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "95%", sm: "70%" }, maxWidth: 1200 },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          py: 1,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#3072b0",
          color: "white",
          fontWeight: 600,
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          {/* Violation Details */}
           {dialogTitle}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Dynamic Details */}
        <Box
          sx={{
            py: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 0.3,
          }}
        >
          {details &&
            Object.entries(details)
              .filter(([key]) => key !== String(imageKey))
              .map(([key, value]) => (
                <Typography
                  key={key}
                  variant="body2"
                  sx={{ mb: 0.5 }}
                  component="div"
                >
                  <strong>{key}:</strong>

                   {String(value)}
                </Typography>

                
              ))}
          {/* Download Button */}
          {/* {imageUrl && ( */}
          <IconButton
            onClick={() => {
              if (onDownload) {
                onDownload(imageUrl);
              } else {
                console.log("Download clicked", imageUrl);
              }
            }}
            sx={{ color: "#3072b0" }}
          >
            <DownloadForOfflineIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* Image Preview */}
        <Box
          sx={{
            textAlign: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            bgcolor: "#fafafa",
            height: 650,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showPlaceholder ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "#f5f5f5",
                border: "2px dashed #ccc",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography variant="h4" sx={{ color: "#bbb" }}>
                📷
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No Image Available
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
              <Image
                src={imageUrl}
                alt="Alert"
                fill
                style={{ objectFit: "cover", borderRadius: 8 }}
                unoptimized
                onError={handleImageError}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ViewAlertPopup;
