import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import Image from "next/image";

export interface Violation {
  violation?: string;
  zone: string;
  time: string;
  imageUrl?: string;
  incident?: string;
  [key: string]: string | number | boolean | undefined;
}

interface ViolationCardProps {
  violations: Violation;
  onClick?: () => void;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({
  violations,
  onClick,
}) => {
  return (
    <Card
      sx={{
        backgroundColor: "#fff8e1",
        border: "1px solid #ddd",
        borderRadius: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          p: 1.5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Info */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1c2025",
              mb: 0.5,
            }}
          >
            {violations.violation || violations.incident ||violations.usage || " Violation"}
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#5c6b7d" }}>
            {violations.zone}
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#5c6b7d" }}>
            {violations.time}
          </Typography>
        </Box>

        {/* Image */}
        <Box
          sx={{
            width: "100%",
            height: 120,
            backgroundColor: "#e9ecef",
            borderRadius: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.5,
            border: "1px solid #dee2e6",
            position: "relative",
            overflow: "hidden", // ✅ important
            p: 0.5,
          }}
        >
          {violations.imageUrl ? (
            <Image
              src={String(violations.imageUrl)}
              alt="Violation"
              fill
              style={{
                objectFit: "cover",
                borderRadius: 6,
              }}
              unoptimized
              priority
            />
          ) : (
            <Box sx={{ textAlign: "center", color: "#6c757d" }}>
              <CameraAlt sx={{ fontSize: 24, mb: 0.5 }} />
              <Typography sx={{ fontSize: "12px" }}>
                Violation Image Preview
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
