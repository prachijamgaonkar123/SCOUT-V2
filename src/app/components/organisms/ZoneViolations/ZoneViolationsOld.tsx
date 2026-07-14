"use client";
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  Tooltip,
  Chip,
} from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { SvgIconComponent, Warning } from "@mui/icons-material";

export interface SubViolation {
  label: string;
  value: number;
  icon?: SvgIconComponent;
}

export interface ZoneViolationsdata {
  zone: string;
  violations?: number;
  subViolations?: SubViolation[];
  [key: string]:
    | string
    | number
    | Record<string, SvgIconComponent>
    | SubViolation[]
    | undefined;
}

interface ZoneViolationsProps {
  violationsZone: ZoneViolationsdata[];
  loading?: boolean;
  maxHeight?: number;
  tooltipMessage?: string;
  label?: string;
}

const ZoneViolations: React.FC<ZoneViolationsProps> = ({
  violationsZone,
  loading = false,
  maxHeight,
  tooltipMessage,
  label,
}) => {
  const rows = loading ? Array.from(new Array(4)) : violationsZone;

  return (
    <Card
      sx={{
        height: "100%",
        maxHeight: maxHeight ?? 420,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#d0d0d0",
            borderRadius: "3px",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Warning sx={{ fontSize: 20, color: "#f44336" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1c2025" }}>
              {label ?? " Zone Violations"}
            </Typography>
          </Box>

          {!loading && tooltipMessage && (
            <Tooltip title={tooltipMessage} arrow placement="left">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#f44336",
                }}
              >
                <InfoOutlineIcon />
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Zone Data */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {!loading && violationsZone.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                padding: 4,
                textAlign: "center",
                color: "#808080",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                🚫 No Zone Violations Found
              </Typography>
            </Box>
          ) : (
            rows.map((zone, index) => (
              <Box
                key={index + 1}
                sx={{
                  border: "1px solid #e8eaed",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#fafafa",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0px 3px 12px rgba(0,0,0,0.1)",
                    borderColor: "#d0d0d0",
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={20} />
                  </Box>
                ) : (
                  <>
                    {/* Zone Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#fff",
                        p: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "16px",
                          color: "#1c2025",
                        }}
                      >
                        {zone.zone}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: { xs: 1.5, sm: 2 },
                          flexWrap: "wrap",
                        }}
                      >
                        {Object.keys(zone)
                          .filter(
                            (key) =>
                              key !== "zone" &&
                              key !== "icons" &&
                              key !== "subViolations",
                          )
                          .map((key) => {
                            return (
                              <Chip
                                sx={{
                                  bgcolor: "#ffffff",
                                }}
                                key={key}
                                label={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.875rem",
                                        },
                                        color: "#5c6b7d",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1)}
                                      :
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: { xs: "0.9rem", sm: "1rem" },
                                        fontWeight: 700,
                                        color: "#f44336",
                                      }}
                                    >
                                      {zone[key] as number}
                                    </Typography>
                                  </Box>
                                }
                              />
                            );
                          })}
                      </Box>
                    </Box>

                    {/* Sub Violations */}
                    {zone.subViolations && zone.subViolations.length > 0 && (
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1 },
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: { xs: 1, sm: 1.5 },
                          }}
                        >
                          {zone.subViolations.map(
                            (sub: SubViolation, idx: number) => {
                              const SubIcon = sub.icon;
                              return (
                                <Box
                                  key={idx + 1}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    backgroundColor: "#fff",
                                    p: { xs: 1, sm: 1.25 },
                                    borderRadius: 1.5,
                                    border: "1px solid #e8eaed",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      borderColor: "#ffcdd2",
                                      backgroundColor: "#fff5f5",
                                    },
                                  }}
                                >
                                  {SubIcon && (
                                    <SubIcon
                                      sx={{
                                        fontSize: { xs: "18px", sm: "20px" },
                                        color: "#f44336",
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.8rem",
                                        },
                                        color: "#7a8593",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {sub.label} :
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: {
                                          xs: "1.1rem",
                                          sm: "1.25rem",
                                        },
                                        fontWeight: 700,
                                        color: "#f44336",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {sub.value}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            },
                          )}
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ZoneViolations;
