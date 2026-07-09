"use client";

/**
 * PPE Kit Detection — redesigned UI running on MOCK/STATIC data.
 * No backend calls: KPI tiles, trend, recent incidents, zone activity and
 * the detailed report below are all fed from the MOCK_* constants, and the
 * report filters run client-side against MOCK_REPORT_ROWS.
 *
 * Recent-incident card images: drop your downloaded PPE images into
 *   public/img/ppe/  named  ppe-1.jpg … ppe-6.jpg
 * (or change the imageUrl values in MOCK_RECENT_VIOLATIONS below).
 * Until an image exists, the card shows a dark gradient placeholder.
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { LineChart } from "@mui/x-charts";

import TimeFilter from "@/app/components/organisms/TimeFilterForAllKPI/TimeFilter";

import EngineeringIcon from "@mui/icons-material/Engineering";
import ChecklistIcon from "@mui/icons-material/Checklist";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import CloseIcon from "@mui/icons-material/Close";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { SvgIconComponent } from "@mui/icons-material";

import { ppeKpiConfig } from "./PPEKitDetectionConfig";
import {
  KpiItem,
  KpiColour,
  ZoneViolationInteface,
  FilterParams,
  PPEViolation,
} from "./PPEKitDetection.types";

/* ================= MOCK DATA ================= */

const MOCK_KPI: KpiItem[] = [
  { title: "Total Violations", value: 8, colour: "red" },
  { title: "Missing Helmet", value: 4, colour: "red" },
  { title: "Missing Vest", value: 1, colour: "red" },
  { title: "Missing Glasses", value: 3, colour: "red" },
  { title: "Current Unsafe Zone", value: 2, colour: "blue" },
  { title: "Last Detection Time", value: "14:28:46", colour: "blue" },
];

const MOCK_TREND: { date: string; value: number }[] = [
  { date: "Jul 03", value: 3 },
  { date: "Jul 04", value: 4 },
  { date: "Jul 05", value: 2 },
  { date: "Jul 06", value: 5 },
  { date: "Jul 07", value: 4 },
  { date: "jul 08", value: 3 },
  { date: "Jul 09", value: 5 },
];

const MOCK_TREND_PERCENTAGE = 18;

const MOCK_ZONE_VIOLATIONS: ZoneViolationInteface[] = [
  {
    zone: "Zone A",
    violations: 4,
    subViolations: [
      { label: "Helmet", value: 2 },
      { label: "Vest", value: 1 },
      { label: "Glasses", value: 1 },
    ],
  },
  {
    zone: "Zone B",
    violations: 4,
    subViolations: [
      { label: "Helmet", value: 1 },
      { label: "Vest", value: 0 },
      { label: "Glasses", value: 3 },
    ],
  },
  {
    zone: "Zone C",
    violations: 1,
    subViolations: [
      { label: "Helmet", value: 0 },
      { label: "Vest", value: 0 },
      { label: "Glasses", value: 1 },
    ],
  },
  {
    zone: "Zone D",
    violations: 1,
    subViolations: [
      { label: "Helmet", value: 1 },
      { label: "Vest", value: 0 },
      { label: "Glasses", value: 0 },
    ],
  },
];

const mockViolation = (
  violation: string,
  zone: string,
  cameraId: string,
  time: string,
  alarmTriggered: boolean,
  imageUrl = "",
): PPEViolation => ({
  violation,
  voilation: violation,
  incident: violation,
  zone,
  cameraId,
  time,
  alarmTriggered,
  imageUrl,
});

// 📷 Put your downloaded PPE images in public/img/ppe/ with these names
const MOCK_RECENT_VIOLATIONS: PPEViolation[] = [
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone A",
    "CAM-07",
    "14:28:46 · 2 min ago",
    true,
    "/img/ppe/ppe-1.jpg",
  ),
  mockViolation(
    "Safety vest not worn, Safety glasses missing",
    "Zone B",
    "CAM-14",
    "14:26:30 · 4 min ago",
    false,
    "/img/ppe/ppe-2.webp",
  ),
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone A",
    "CAM-01",
    "14:20:18 · 10 min ago",
    true,
    "/img/ppe/ppe-4.webp",
  ),
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone B",
    "CAM-09",
    "14:18:10 · 12 min ago",
    false,
    "/img/ppe/ppe-5.jpeg",
  ),
  mockViolation(
    "Hard hat missing",
    "Zone D",
    "CAM-09",
    "14:12:55 · 18 min ago",
    false,
    "/img/ppe/ppe-1.jpg",
  ),
  mockViolation(
    "Hard hat missing",
    "Zone C",
    "CAM-05",
    "13:55:02 · 35 min ago",
    true,
    "/img/ppe/ppe-2.webp",
  ),
];

const MOCK_REPORT_ROWS: PPEViolation[] = [
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone A",
    "CAM-01",
    "09-07-2026 15:07:57",
    true,
  ),
  mockViolation(
    "Safety vest not worn, Safety glasses missing",
    "Zone B",
    "CAM-02",
    "09-07-2026 15:07:57",
    true,
  ),
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone A",
    "CAM-03",
    "09-07-2026 15:07:57",
    true,
  ),
  mockViolation(
    "Hard hat missing, Safety glasses missing",
    "Zone A",
    "CAM-04",
    "09-07-2026 15:07:57",
    false,
  ),
  mockViolation(
    "Hard hat missing",
    "Zone B",
    "CAM-05",
    "09-07-2026 15:07:57",
    true,
  ),
];

const MOCK_ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];
const MOCK_CAMERAS = ["CAM-01", "CAM-02", "CAM-03", "CAM-04", "CAM-05"];

/* ================= SHARED STYLES ================= */

const cardSx = {
  p: 3,
  borderRadius: 2,
  bgcolor: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  height: "100%",
} as const;

const sectionTitleSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
} as const;

const tableHeadCellSx = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
} as const;

/* ================= BREAKDOWN CARD ================= */

interface BreakdownTile {
  label: string;
  value: number | string;
  icon: SvgIconComponent;
  colour: KpiColour;
}

const tileColours: Record<KpiColour, { bg: string; fg: string }> = {
  red: { bg: "#fee2e2", fg: "#dc2626" },
  blue: { bg: "#dbeafe", fg: "#2563eb" },
  green: { bg: "#dcfce7", fg: "#16a34a" },
};

const ViolationBreakdownCard: React.FC<{ tiles: BreakdownTile[] }> = ({
  tiles,
}) => (
  <Paper sx={cardSx}>
    <Box sx={{ ...sectionTitleSx, mb: 2.5 }}>
      <ChecklistIcon sx={{ color: "#0d9488", fontSize: 22 }} />
      <Typography variant="subtitle1" fontWeight={700}>
        Violation Breakdown
      </Typography>
    </Box>

    <Grid container spacing={2.5}>
      {tiles.map((tile) => {
        const colours = tileColours[tile.colour] ?? tileColours.red;
        const Icon = tile.icon;
        return (
          <Grid key={tile.label} size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: colours.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ color: colours.fg, fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                  {tile.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tile.label}
                </Typography>
              </Box>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  </Paper>
);

/* ================= TREND CARD ================= */

export interface TrendPoint {
  date: string;
  value: number;
}

const ViolationsTrendCard: React.FC<{
  data: TrendPoint[];
  trendPercentage: number;
}> = ({ data, trendPercentage }) => (
  <Paper sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
    <Box sx={{ ...sectionTitleSx, mb: 1 }}>
      <TrendingUpIcon sx={{ color: "#2563eb", fontSize: 22 }} />
      <Typography variant="subtitle1" fontWeight={700}>
        Violations Trend (7 Days)
      </Typography>
      <Chip
        label={`${trendPercentage >= 0 ? "↑" : "↓"} ${Math.abs(trendPercentage)}%`}
        size="small"
        sx={{
          ml: 1,
          bgcolor: "#fee2e2",
          color: "#dc2626",
          fontWeight: 700,
          fontSize: "0.75rem",
        }}
      />
    </Box>

    <Box sx={{ flex: 1, minHeight: 220 }}>
      <LineChart
        height={220}
        xAxis={[{ data: data.map((d) => d.date), scaleType: "point" }]}
        series={[
          {
            data: data.map((d) => d.value),
            color: "#e02424",
            curve: "natural",
            area: true,
            showMark: true,
          },
        ]}
        grid={{ horizontal: true }}
        margin={{ left: 10, right: 20, top: 20, bottom: 10 }}
        hideLegend
        sx={{
          "& .MuiAreaElement-root": { fill: "rgba(224, 36, 36, 0.08)" },
          "& .MuiMarkElement-root": {
            stroke: "#e02424",
            fill: "#e02424",
          },
          "& .MuiLineElement-root": { strokeWidth: 2.5 },
        }}
      />
    </Box>
  </Paper>
);

/* ================= RECENT INCIDENTS (carousel) ================= */

const RecentIncidentsSection: React.FC<{
  violations: PPEViolation[];
  onCardClick: (v: PPEViolation) => void;
  onViewAll: () => void;
}> = ({ violations, onCardClick, onViewAll }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollNext = () =>
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });

  return (
    <Paper sx={cardSx}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={sectionTitleSx}>
          <WarningAmberIcon sx={{ color: "#f59e0b", fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Recent Incidents
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onViewAll}
          sx={{ textTransform: "none", fontWeight: 600, color: "#2563eb" }}
        >
          View all →
        </Button>
      </Box>

      {violations.length === 0 ? (
        <Box
          sx={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          No recent incidents
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              flex: 1,
            }}
          >
            {violations.map((v, idx) => (
              <Box
                key={idx + 1}
                onClick={() => onCardClick(v)}
                sx={{
                  minWidth: 240,
                  maxWidth: 240,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
                }}
              >
                {/* Image area: gradient stays as fallback while image is missing */}
                <Box
                  sx={{
                    position: "relative",
                    height: 140,
                    background: v.imageUrl
                      ? `url(${v.imageUrl}) center/cover no-repeat, radial-gradient(ellipse at 50% 90%, #7c2d12 0%, #1e293b 70%)`
                      : "radial-gradient(ellipse at 50% 90%, #7c2d12 0%, #1e293b 70%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!v.imageUrl && (
                    <EngineeringIcon
                      sx={{ color: "rgba(255,255,255,0.8)", fontSize: 36 }}
                    />
                  )}
                  <Chip
                    label="PPE"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "#dc2626",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                  <Chip
                    label={v.alarmTriggered ? "HIGH" : "MED"}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: v.alarmTriggered ? "#d97706" : "#f59e0b",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                </Box>

                {/* Card body */}
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    title={String(v.violation ?? "PPE violation")}
                  >
                    {v.violation ?? "PPE violation"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {v.zone}
                    {v.cameraId ? ` · ${v.cameraId}` : ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    noWrap
                  >
                    {v.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <IconButton
            onClick={scrollNext}
            sx={{
              border: "1px solid #e2e8f0",
              bgcolor: "#fff",
              flexShrink: 0,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Paper>
  );
};

/* ================= ZONE ACTIVITY ================= */

const ZoneActivitySection: React.FC<{
  zones: ZoneViolationInteface[];
}> = ({ zones }) => {
  // Union of sub-violation labels across zones → dynamic columns (Helmet, Vest, Glasses)
  const subLabels = useMemo(() => {
    const labels: string[] = [];
    zones.forEach((z) =>
      z.subViolations?.forEach((s) => {
        if (!labels.includes(s.label)) labels.push(s.label);
      }),
    );
    return labels;
  }, [zones]);

  const maxTotal = Math.max(...zones.map((z) => z.violations), 1);

  return (
    <Paper sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={sectionTitleSx}>
          <OutlinedFlagIcon sx={{ color: "#2563eb", fontSize: 22 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Zone Activity
          </Typography>
        </Box>
        <Tooltip title="PPE violations per zone">
          <InfoOutlinedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
        </Tooltip>
      </Box>

      {zones.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          No zone activity
        </Box>
      ) : (
        // flex + height:100% lets the rows stretch to fill the card,
        // so there is no blank space under the last row
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" sx={{ height: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeadCellSx}>Zone</TableCell>
                {subLabels.map((label) => (
                  <TableCell key={label} align="center" sx={tableHeadCellSx}>
                    {label}
                  </TableCell>
                ))}
                <TableCell sx={tableHeadCellSx}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.zone} sx={{ "& td": { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    {zone.zone}
                  </TableCell>
                  {subLabels.map((label) => {
                    const sub = zone.subViolations?.find(
                      (s) => s.label === label,
                    );
                    const value = sub?.value ?? 0;
                    return (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: value > 0 ? "#dc2626" : "text.secondary",
                        }}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ minWidth: 110 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {zone.violations}
                      </Typography>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          flexShrink: 0,
                          width: `${Math.max(
                            (zone.violations / maxTotal) * 70,
                            10,
                          )}px`,
                          background:
                            "linear-gradient(90deg, #ef4444, #f59e0b)",
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

/* ================= INCIDENT DETAIL POPUP ================= */

const IncidentDetailDialog: React.FC<{
  open: boolean;
  violation: PPEViolation | null;
  onClose: () => void;
}> = ({ open, violation, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    {violation && (
      <>
        {/* Title bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {violation.violation}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {/* Snapshot if available, otherwise LIVE video placeholder */}
          <Box
            sx={{
              position: "relative",
              height: 260,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: violation.imageUrl
                ? `url(${violation.imageUrl}) center/cover no-repeat, #334155`
                : "#334155",
              mb: 1,
            }}
          >
            {!violation.imageUrl && (
              <VideocamOutlinedIcon
                sx={{ color: "#94a3b8", fontSize: 48 }}
              />
            )}
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    ml: 1,
                  }}
                />
              }
              label="LIVE"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Box>

          {/* Details rows */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 1.75,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Typography color="text.secondary">Zone</Typography>
            <Typography fontWeight={600}>{violation.zone}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 1.75,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Typography color="text.secondary">Camera</Typography>
            <Typography fontWeight={600}>{violation.cameraId}</Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#0f172a",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);

/* ================= DETAILED REPORT ================= */

interface ReportFilterState {
  violation: string;
  zone: string;
  cameraId: string;
  alarmTriggered: string;
  startDate: string;
  endDate: string;
}

const emptyFilters: ReportFilterState = {
  violation: "",
  zone: "",
  cameraId: "",
  alarmTriggered: "",
  startDate: "",
  endDate: "",
};

const DetailedReportSection: React.FC<{
  rows: PPEViolation[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onApply: (filters: FilterParams) => void;
  onReset: () => void;
  onExport: (filters: FilterParams) => void;
  onView: (row: PPEViolation) => void;
  onDownload: (row: PPEViolation, index: number) => void;
}> = ({
  rows,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onApply,
  onReset,
  onExport,
  onView,
  onDownload,
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ReportFilterState>(emptyFilters);

  const hasFilters = Object.values(filters).some((v) => v !== "");
  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startEntry = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const endEntry = Math.min((page + 1) * rowsPerPage, totalCount);

  const toFilterParams = (): FilterParams => ({
    violation: filters.violation || undefined,
    zone: filters.zone || undefined,
    cameraId: filters.cameraId || undefined,
    alarmTriggered: filters.alarmTriggered || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });

  const handleReset = () => {
    setFilters(emptyFilters);
    onReset();
  };

  const selectFilters = [
    {
      id: "violation" as const,
      label: t("Violation"),
      options: [
        "Hard hat missing",
        "Safety vest not worn",
        "Safety glasses missing",
      ],
    },
    { id: "zone" as const, label: t("Zone"), options: MOCK_ZONES },
    { id: "cameraId" as const, label: t("Camera"), options: MOCK_CAMERAS },
    {
      id: "alarmTriggered" as const,
      label: t("Alarm Triggered"),
      options: ["True", "False"],
    },
  ];

  const filterLabelSx = {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    mb: 0.5,
    display: "block",
  } as const;

  return (
    <Paper sx={{ ...cardSx, p: 0, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={sectionTitleSx}>
          <DescriptionOutlinedIcon sx={{ color: "#2563eb", fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700}>
            {t("Detailed Report")}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => onExport(toFilterParams())}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#e2e8f0",
            color: "#0f172a",
            borderRadius: 2,
          }}
        >
          {t("Download")}
        </Button>
      </Box>

      {/* Filters band */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 2,
          px: 3,
          py: 2,
          bgcolor: "#f8fafc",
          borderTop: "1px solid #eef2f7",
          borderBottom: "1px solid #eef2f7",
        }}
      >
        {selectFilters.map((f) => (
          <Box key={f.id} sx={{ minWidth: 150 }}>
            <Typography component="span" sx={filterLabelSx}>
              {f.label}
            </Typography>
            <Select
              size="small"
              fullWidth
              displayEmpty
              value={filters[f.id]}
              sx={{ bgcolor: "#fff" }}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, [f.id]: e.target.value }))
              }
            >
              <MenuItem value="">{t("All")}</MenuItem>
              {f.options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Box>
        ))}

        <Box>
          <Typography component="span" sx={filterLabelSx}>
            {t("Date Range")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              type="date"
              sx={{ bgcolor: "#fff" }}
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
            <TextField
              size="small"
              type="date"
              sx={{ bgcolor: "#fff" }}
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, ml: "auto" }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#0f172a",
              bgcolor: "#fff",
              borderRadius: 2,
            }}
          >
            {t("Reset")}
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!hasFilters}
            onClick={() => onApply(toFilterParams())}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {t("Apply Filters")}
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadCellSx}>{t("Violation")}</TableCell>
              <TableCell sx={tableHeadCellSx}>{t("Time")}</TableCell>
              <TableCell sx={tableHeadCellSx}>{t("Zone")}</TableCell>
              <TableCell sx={tableHeadCellSx}>{t("Cameras")}</TableCell>
              <TableCell sx={tableHeadCellSx}>{t("Alarm Triggered")}</TableCell>
              <TableCell sx={tableHeadCellSx}>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  {t("No data available")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={index + 1}
                  hover
                  sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafbfc" } }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.violation}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.time}
                  </TableCell>
                  <TableCell>{row.zone}</TableCell>
                  <TableCell>{row.cameraId}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.alarmTriggered ? "TRUE" : "FALSE"}
                      size="small"
                      sx={{
                        bgcolor: row.alarmTriggered ? "#dcfce7" : "#f1f5f9",
                        color: row.alarmTriggered ? "#16a34a" : "#64748b",
                        fontWeight: 700,
                        fontSize: 11,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <IconButton size="small" onClick={() => onView(row)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDownload(row, index)}
                    >
                      <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer: entries info + numbered pagination + rows-per-page */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          px: 3,
          py: 2,
          borderTop: "1px solid #eef2f7",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {`Showing ${startEntry} to ${endEntry} of ${totalCount} entries`}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          {Array.from({ length: pageCount }).map((_, i) => (
            <Button
              key={i + 1}
              size="small"
              disableElevation
              variant={i === page ? "contained" : "outlined"}
              onClick={() => onPageChange(i)}
              sx={{
                minWidth: 34,
                height: 34,
                p: 0,
                borderRadius: 1.5,
                fontWeight: 600,
                ...(i !== page && {
                  borderColor: "#e2e8f0",
                  color: "#0f172a",
                }),
              }}
            >
              {i + 1}
            </Button>
          ))}
          <IconButton
            size="small"
            disabled={page >= pageCount - 1}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          sx={{ borderRadius: 2 }}
        >
          {[10, 15, 20].map((n) => (
            <MenuItem key={n} value={n}>
              {n} / page
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Paper>
  );
};

/* ================= PAGE COMPONENT ================= */

const PPEDetectionNew: React.FC = () => {
  const { t } = useTranslation();

  /* ---------- STATE (mock-backed) ---------- */
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [filteredRows, setFilteredRows] =
    useState<PPEViolation[]>(MOCK_REPORT_ROWS);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [viewPopupOpen, setViewPopupOpen] = useState(false);
  const [viewPopupData, setViewPopupData] = useState<PPEViolation | null>(null);

  const reportRef = useRef<HTMLDivElement | null>(null);

  /* ---------- TIME FILTER (mock: only toggles live badge) ---------- */
  const handleTimeRangeChange = useCallback(
    (range: { start?: string; end?: string }) => {
      setIsLiveMode(!range.start && !range.end);
    },
    [],
  );

  /* ---------- DERIVED DATA ---------- */
  const breakdownTiles = useMemo<BreakdownTile[]>(
    () =>
      MOCK_KPI.map((item) => {
        const config = ppeKpiConfig[item.title];
        return {
          label: t(item.title),
          value: item.value,
          icon: config?.icon || EngineeringIcon,
          colour: item.colour ?? "red",
        };
      }),
    [t],
  );

  const pagedRows = useMemo(
    () => filteredRows.slice(page * limit, page * limit + limit),
    [filteredRows, page, limit],
  );

  /* ---------- REPORT HANDLERS (client-side on mock data) ---------- */

  const handleSubmitFilter = useCallback((filters: FilterParams) => {
    setPage(0);
    setFilteredRows(
      MOCK_REPORT_ROWS.filter((row) => {
        if (
          filters.violation &&
          !String(row.violation)
            .toLowerCase()
            .includes(filters.violation.toLowerCase())
        )
          return false;
        if (filters.zone && row.zone !== filters.zone) return false;
        if (filters.cameraId && row.cameraId !== filters.cameraId)
          return false;
        if (
          filters.alarmTriggered &&
          row.alarmTriggered !== (filters.alarmTriggered === "True")
        )
          return false;
        return true;
      }),
    );
  }, []);

  const handleReset = useCallback(() => {
    setPage(0);
    setFilteredRows(MOCK_REPORT_ROWS);
  }, []);

  // Mock export / downloads: no backend call
  const handleExport = useCallback((filters: FilterParams) => {
    console.log("mock export", filters);
  }, []);

  const handleDownloadSingle = useCallback(
    (row: PPEViolation, index: number) => {
      console.log("mock single download", row, index);
    },
    [],
  );

  const handleViewSingle = useCallback((row: PPEViolation) => {
    setViewPopupData(row);
    setViewPopupOpen(true);
  }, []);

  const scrollToReport = () =>
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ---------- RENDER ---------- */
  return (
    <Box>
      {/* Page header: description + live badge + time filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HealthAndSafetyIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          <Typography variant="body1" color="text.secondary">
            {t(
              "Real-time PPE compliance monitoring across all monitored zones, powered by visual AI analysis",
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isLiveMode && (
            <Chip
              label={t("Live")}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#16a34a",
                fontWeight: 700,
                "& .MuiChip-label": { px: 1.5 },
              }}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#16a34a",
                    ml: 1,
                  }}
                />
              }
            />
          )}
          <TimeFilter onRangeChange={handleTimeRangeChange} />
        </Box>
      </Box>

      {/* Violation Breakdown + Trend */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <ViolationBreakdownCard tiles={breakdownTiles} />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <ViolationsTrendCard
            data={MOCK_TREND}
            trendPercentage={MOCK_TREND_PERCENTAGE}
          />
        </Grid>
      </Grid>

      {/* Recent Incidents + Zone Activity */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RecentIncidentsSection
            violations={MOCK_RECENT_VIOLATIONS}
            onCardClick={handleViewSingle}
            onViewAll={scrollToReport}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ZoneActivitySection zones={MOCK_ZONE_VIOLATIONS} />
        </Grid>
      </Grid>

      {/* Detailed Report */}
      <Box ref={reportRef}>
        <DetailedReportSection
          rows={pagedRows}
          totalCount={filteredRows.length}
          page={page}
          rowsPerPage={limit}
          onPageChange={setPage}
          onRowsPerPageChange={(rows) => {
            setLimit(rows);
            setPage(0);
          }}
          onApply={handleSubmitFilter}
          onReset={handleReset}
          onExport={handleExport}
          onView={handleViewSingle}
          onDownload={handleDownloadSingle}
        />
      </Box>

      <IncidentDetailDialog
        open={viewPopupOpen}
        violation={viewPopupData}
        onClose={() => setViewPopupOpen(false)}
      />
    </Box>
  );
};

export default PPEDetectionNew;
