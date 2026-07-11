"use client";
import React from "react";
import { Card, CardContent, Box, Typography, Skeleton } from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { SvgIconComponent } from "@mui/icons-material";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";

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

// Cycled per sub-violation column so each type reads as visually distinct,
// same way the reference table colors "Fire" red and "Smoke" amber.
const COLUMN_COLORS = [
  DASHBOARD_COLORS.error,
  "#B45309", // amber/brown, matches the "smoke" column in the reference
  DASHBOARD_COLORS.primary,
  DASHBOARD_COLORS.success,
];

const ZoneViolations: React.FC<ZoneViolationsProps> = ({
  violationsZone,
  loading = false,
  maxHeight,
  tooltipMessage,
  label,
}) => {
  // Column set is the union of every sub-violation label across all zones,
  // in first-seen order, so zones with fewer types still line up correctly.
  const columns: { label: string; icon?: SvgIconComponent }[] = [];
  violationsZone.forEach((zone) => {
    zone.subViolations?.forEach((sub) => {
      if (!columns.some((c) => c.label === sub.label)) {
        columns.push({ label: sub.label, icon: sub.icon });
      }
    });
  });

  const totalFor = (zone: ZoneViolationsdata) =>
    zone.violations ?? zone.subViolations?.reduce((sum, s) => sum + s.value, 0) ?? 0;

  return (
    <Card
      sx={{
        height: "100%",
        // Content-driven, not clipped: with only a handful of zones the table
        // never needs its own scrollbar — it just matches whatever height the
        // sibling Recent Violations card ends up being (Grid stretch).
        ...(maxHeight ? { maxHeight } : {}),
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        backgroundColor: DASHBOARD_COLORS.card,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <FlagOutlinedIcon sx={{ fontSize: 20, color: DASHBOARD_COLORS.secondary }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: DASHBOARD_COLORS.textPrimary }}>
            {label ?? "Zone Violations"}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index + 1} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        ) : violationsZone.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 4,
              textAlign: "center",
              color: DASHBOARD_COLORS.textSecondary,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              🚫 No Zone Violations Found
            </Typography>
          </Box>
        ) : columns.length === 0 ? (
          // No sub-violation breakdown for this use case (e.g. Fall Detection) —
          // a multi-column table would render mostly empty, so use a clean
          // icon + zone + total list instead. No bar, per feedback on the table view.
          <Box>
            {violationsZone.map((zone, index) => (
              <Box
                key={index + 1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  py: "12px",
                  borderBottom: index < violationsZone.length - 1 ? `1px solid ${DASHBOARD_COLORS.border}` : "none",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: DASHBOARD_COLORS.errorTint,
                    color: DASHBOARD_COLORS.error,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ flex: "1 1 0", fontSize: 13.5, fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
                  {zone.zone}
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: DASHBOARD_COLORS.error }}>
                  {totalFor(zone)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          // Has a sub-violation breakdown (e.g. PPE: Helmet/Vest/Glasses) —
          // one card per zone with a colored total badge and a row of tinted
          // pill chips per violation type, instead of a flat table.
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {violationsZone.map((zone, index) => (
              <Box
                key={index + 1}
                sx={{
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "10px 14px",
                    backgroundColor: DASHBOARD_COLORS.bg,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        backgroundColor: DASHBOARD_COLORS.errorTint,
                        color: DASHBOARD_COLORS.error,
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: DASHBOARD_COLORS.textPrimary }}>
                      {zone.zone}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      backgroundColor: DASHBOARD_COLORS.errorTint,
                      color: DASHBOARD_COLORS.error,
                      borderRadius: "20px",
                      px: "10px",
                      py: "3px",
                    }}
                  >
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>Total</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{totalFor(zone)}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "nowrap", gap: "6px", p: "10px 12px" }}>
                  {zone.subViolations?.map((sub) => {
                    const colorIndex = columns.findIndex((c) => c.label === sub.label);
                    const color = COLUMN_COLORS[colorIndex % COLUMN_COLORS.length];
                    const SubIcon = sub.icon;
                    return (
                      <Box
                        key={sub.label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          minWidth: 0,
                          flex: "1 1 0",
                          backgroundColor: DASHBOARD_COLORS.card,
                          border: `1px solid ${DASHBOARD_COLORS.border}`,
                          borderRadius: "8px",
                          px: "8px",
                          py: "5px",
                        }}
                      >
                        {SubIcon && <SubIcon sx={{ fontSize: 13, color, flexShrink: 0 }} />}
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: DASHBOARD_COLORS.textSecondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {sub.label}
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0, ml: "auto" }}>
                          {sub.value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneViolations;
