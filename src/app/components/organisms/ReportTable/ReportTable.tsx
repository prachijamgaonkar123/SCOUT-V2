"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Menu,
  Skeleton,
  IconButton,
  Card,
  TablePagination,
  Tooltip,
  CircularProgress,
  styled,
} from "@mui/material";
import { Description, Visibility, Download } from "@mui/icons-material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

// ----------------------------------------------
// Design tokens
// ----------------------------------------------
const COLORS = {
  primary: "#1E3A8A",
  primaryDark: "#152C6B",
  primaryTint: "#EEF2FB",
  secondary: "#2563EB",
  secondaryDark: "#1D4ED8",
  success: "#16A34A",
  successTint: "#EAF9EF",
  error: "#DC2626",
  errorTint: "#FDECEC",
  warning: "#F59E0B",
  warningTint: "#FEF6E7",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  hover: "#F3F4F6",
};

// ----------------------------------------------
// Shared filter input styling (used by EVERY filter type
// - text, select, date, datetime - so they all render at
// the exact same height, 30px)
// ----------------------------------------------
const FILTER_INPUT_SX = {
  "& .MuiInputBase-root": {
    minHeight: "30px !important",
    height: "30px",
    fontSize: "12px",
    borderRadius: "6px",
    backgroundColor: COLORS.card,
    padding: "0 8px !important",
    boxSizing: "border-box",
  },
  "& .MuiSelect-select": { padding: "4px 8px !important", minHeight: "auto" },
  "& .MuiInputBase-input": { padding: "4px 8px !important", height: "auto" },
  "& .MuiFormHelperText-root": { display: "none" },
  "& .MuiInputAdornment-root": { marginRight: 0 },
  // constrain the calendar/clock icon button so it doesn't
  // stretch the field taller than the 30px text/select fields
  "& .MuiInputAdornment-root .MuiIconButton-root": {
    width: 22,
    height: 22,
    padding: 0,
  },
};

// Popper (calendar/time popup) styling - sized generously so
// nothing gets clipped, with scroll as a safety net
const PICKER_POPPER_SX = {
  "& .MuiPaper-root": {
    minWidth: "300px",
    width: "auto",
    maxHeight: "420px",
    overflowY: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  "& .MuiPickersCalendarHeader-root": {
    padding: "8px 12px",
    minHeight: "36px",
  },
  "& .MuiPickersCalendarHeader-label": {
    fontSize: "13px",
    fontWeight: 600,
  },
  "& .MuiPickersDay-root": {
    fontSize: "12px",
    width: "30px",
    height: "30px",
  },
  "& .MuiPickersDay-root.Mui-selected": {
    backgroundColor: COLORS.primary,
    color: "#fff",
  },
  "& .MuiDayCalendar-header .MuiTypography-root": {
    fontSize: "10px",
    fontWeight: 600,
    color: COLORS.textSecondary,
  },
  "& .MuiPickersToolbar-root": {
    display: "none", // Hide toolbar for compact view
  },
  "& .MuiDialogActions-root": {
    padding: "6px 12px",
    "& .MuiButton-root": {
      fontSize: "12px",
      minHeight: "28px",
      textTransform: "none",
    },
  },
  // time column used by DateTimePicker
  "& .MuiMultiSectionDigitalClock-root": {
    maxHeight: "280px",
  },
  "& .MuiMultiSectionDigitalClock-root .MuiMenuItem-root": {
    fontSize: "12px",
  },
};

// ----------------------------------------------
// Styled components
// ----------------------------------------------
const StyledCard = styled(Card)({
  borderRadius: "12px",
  overflow: "hidden",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)",
});

const FilterBar = styled(Box)({
  display: "flex",
  flexWrap: "nowrap",
  gap: "8px",
  padding: "8px 16px",
  alignItems: "center",
  background: COLORS.bg,
  borderTop: `1px solid ${COLORS.border}`,
  borderBottom: `1px solid ${COLORS.border}`,
  overflowX: "auto",
  "&::-webkit-scrollbar": { height: 4 },
  "&::-webkit-scrollbar-thumb": { background: COLORS.border, borderRadius: 4 },
});

const FilterField = styled(Box)({
  flex: "0 1 auto",
  minWidth: "100px",
  maxWidth: "160px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  "& .MuiInputLabel-root": {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: COLORS.textSecondary,
    lineHeight: 1.2,
    marginBottom: 2,
    transform: "none",
    position: "relative",
  },
});

const ActionButton = styled(Button)({
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "6px",
  minHeight: "30px",
  height: "30px",
  fontSize: "12px",
  padding: "0 12px",
  borderColor: COLORS.border,
  color: COLORS.textPrimary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primaryTint,
  },
  "&.Mui-disabled": {
    color: "#9CA3AF",
    backgroundColor: "#E5E7EB",
  },
});

// ----------------------------------------------
// Types
// ----------------------------------------------
type FilterType = "text" | "select" | "date" | "datetime";

export interface ReportColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
}

export type FilterOption = string | number | boolean;

export interface ReportFilter<T> {
  id: keyof T;
  label: string;
  type: FilterType;
  options?: FilterOption[];
}

interface ReportTableProps<T extends object> {
  title?: string;
  columns: ReportColumn<T>[];
  data: T[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  downloadFileName: string;
  filters?: ReportFilter<T>[];
  onSubmit?: (filters: Record<string, string>) => void;
  onReset?: () => void;
  onExport?: (format: "csv" | "pdf", filters: Record<string, string>) => void;
  exportLoading?: boolean;
  loading?: boolean;
  isSubmitDisabled?: boolean;
  onView?: (row: T) => void;
  onDownload?: (row: T, index: number) => void;
  downloadingRows?: Set<number>;
  tooltipMessage: string;
}

// ----------------------------------------------
// Main Component
// ----------------------------------------------
function ReportTable<T extends Record<string, string | number | boolean>>({
  title,
  columns,
  data,
  filters = [],
  onSubmit,
  onReset,
  onExport,
  exportLoading = false,
  loading = false,
  isSubmitDisabled,
  onView,
  onDownload,
  downloadingRows,
  tooltipMessage,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ReportTableProps<T>) {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterValues, setFilterValues] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>
  );
  const [dateTimeValues, setDateTimeValues] = useState<
    Record<string, Dayjs | null>
  >({});

  const hasActiveFilters = useMemo(() => {
    const hasTextFilters = Object.values(filterValues).some(
      (value) => value !== "" && value !== undefined
    );
    const hasDateFilters = Object.values(dateTimeValues).some(
      (value) => value !== null && value !== undefined
    );
    return hasTextFilters || hasDateFilters;
  }, [filterValues, dateTimeValues]);

  const isDateRangeValid = useMemo(() => {
    const start = dateTimeValues["startDate"];
    const end = dateTimeValues["endDate"];
    const now = dayjs();
    const threeMonthsAgo = now.subtract(3, "month");
    if (!start || !end) return true;
    if (start.isAfter(end)) return false;
    if (start.isBefore(threeMonthsAgo)) return false;
    if (end.isAfter(now)) return false;
    return true;
  }, [dateTimeValues]);

  const handleFilterChange = (id: keyof T, value: string) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateTimeChange = (label: string, value: Dayjs | null) => {
    setDateTimeValues((prev) => ({ ...prev, [label]: value }));
  };

  const getDateConstraints = (fieldId: string) => {
    const now = dayjs();
    const threeMonthsAgo = now.subtract(3, "month");
    if (fieldId === "startDate") {
      const endDate = dateTimeValues["endDate"];
      return {
        minDate: threeMonthsAgo,
        maxDate: endDate ?? now,
      };
    }
    if (fieldId === "endDate") {
      const startDate = dateTimeValues["startDate"];
      return {
        minDate: startDate ?? threeMonthsAgo,
        maxDate: now,
      };
    }
    return { minDate: threeMonthsAgo, maxDate: now };
  };

  const buildCombinedFilters = () => ({
    ...filterValues,
    ...Object.fromEntries(
      Object.entries(dateTimeValues)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => [key, value!.toISOString()])
    ),
  });

  const handleSubmit = async () => {
    onSubmit?.(buildCombinedFilters());
  };

  const handleReset = () => {
    setFilterValues({} as Record<keyof T, string>);
    setDateTimeValues({});
    onReset?.();
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleExportClick = (format: "csv" | "pdf") => {
    onExport?.(format, buildCombinedFilters());
    handleClose();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "present":
      case "resolved":
        return { color: COLORS.success, bgColor: COLORS.successTint };
      case "missing":
      case "violation":
      case "breach":
        return { color: COLORS.error, bgColor: COLORS.errorTint };
      case "on_break":
      case "late_arrival":
      case "warning":
        return { color: COLORS.warning, bgColor: COLORS.warningTint };
      case "investigating":
      case "pending":
        return { color: COLORS.secondary, bgColor: COLORS.primaryTint };
      default:
        return { color: "#666", bgColor: "#f5f5f5" };
    }
  };

  const renderCellValue = (
    column: ReportColumn<T>,
    value: string | number | boolean
  ) => {
    if (typeof value === "boolean") {
      return (
        <Chip
          label={value ? "TRUE" : "FALSE"}
          size="small"
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            height: 22,
            borderRadius: "6px",
            color: value ? "#0F7A38" : COLORS.textSecondary,
            backgroundColor: value ? COLORS.successTint : COLORS.hover,
          }}
        />
      );
    }

    if (String(column.id).toLowerCase() === "status") {
      const colors = getStatusColor(String(value));
      return (
        <Chip
          label={String(value)}
          size="small"
          sx={{
            fontSize: "12px",
            fontWeight: 500,
            color: colors.color,
            backgroundColor: colors.bgColor,
            height: 24,
            textTransform: "uppercase",
            borderRadius: "6px",
          }}
        />
      );
    }

    if (String(column.id).toLowerCase().includes("id")) {
      return (
        <Typography sx={{ fontSize: "13.5px", fontWeight: 500, color: COLORS.textPrimary }}>
          {String(value)}
        </Typography>
      );
    }

    return (
      <Typography sx={{ fontSize: "13.5px", color: COLORS.textPrimary }}>
        {String(value)}
      </Typography>
    );
  };

  const renderFilter = (filter: ReportFilter<T>) => {
    if (filter.type === "date" || filter.type === "datetime") {
      const fieldId = filter.id as string;
      const constraints = getDateConstraints(fieldId);
      const isDateTime = filter.type === "datetime";
      // Use DateTimePicker (adds a time column) for "datetime"
      // filters, plain DatePicker (day/month/year only) for "date"
      const PickerComponent = isDateTime ? DateTimePicker : DatePicker;
      const displayFormat = isDateTime ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY";

      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PickerComponent
            label={filter.label}
            value={dateTimeValues[fieldId] ?? null}
            onChange={(newValue) =>
              handleDateTimeChange(fieldId, newValue ? dayjs(newValue) : null)
            }
            minDate={constraints.minDate}
            maxDate={constraints.maxDate}
            format={displayFormat}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                placeholder: displayFormat,
                error: !isDateRangeValid,
                helperText: !isDateRangeValid ? "Invalid" : "",
                sx: FILTER_INPUT_SX,
              },
              popper: {
                sx: PICKER_POPPER_SX,
              },
            }}
          />
        </LocalizationProvider>
      );
    }

    const commonProps = {
      label: filter.label,
      fullWidth: true,
      size: "small" as const,
      value: filterValues[filter.id] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFilterChange(filter.id, e.target.value),
      sx: FILTER_INPUT_SX,
    };

    if (filter.type === "text") return <TextField {...commonProps} />;
    if (filter.type === "select")
      return (
        <TextField {...commonProps} select>
          {filter.options?.map((opt, index) => {
            const value = opt ?? "";
            return (
              <MenuItem key={index + 1} value={value.toString()}>
                {value.toString()}
              </MenuItem>
            );
          })}
        </TextField>
      );

    return null;
  };

  // Build table rows
  let tableRows: React.ReactElement[] = [];
  if (loading) {
    tableRows = [...Array(5)].map((_, rowIndex) => (
      <TableRow key={rowIndex + 1}>
        {columns.map((_, colIndex) => (
          <TableCell key={colIndex + 1}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
        <TableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </TableCell>
      </TableRow>
    ));
  } else if (data.length > 0) {
    tableRows = data.map((row, index) => (
      <TableRow
        key={index + 1}
        sx={{
          "&:nth-of-type(odd)": { backgroundColor: "#FAFBFC" },
          "&:hover": { backgroundColor: COLORS.hover },
          "& td": {
            padding: "14px 16px",
            fontSize: "13.5px",
            color: COLORS.textPrimary,
            borderBottom: `1px solid ${COLORS.border}`,
          },
          "&:last-child td": { borderBottom: "none" },
        }}
      >
        {columns.map((column, idx) => (
          <TableCell key={idx + 1} align={column.align ?? "left"}>
            {renderCellValue(column, row[column.id])}
          </TableCell>
        ))}
        <TableCell align="center">
          <IconButton
            size="small"
            onClick={() => onView?.(row)}
            sx={{ color: COLORS.textSecondary }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDownload?.(row, index)}
            disabled={downloadingRows?.has(index)}
            sx={{ color: COLORS.textSecondary }}
          >
            {downloadingRows?.has(index) ? (
              <CircularProgress size={16} />
            ) : (
              <Download fontSize="small" />
            )}
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  } else {
    tableRows = [
      <TableRow key="no-data">
        <TableCell colSpan={columns.length + 1} align="center">
          <Typography sx={{ fontSize: "13.5px", color: COLORS.textSecondary }}>
            No matching records found
          </Typography>
        </TableCell>
      </TableRow>,
    ];
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <StyledCard>
        {/* Header */}
        <Box
          sx={{
            p: "12px 18px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {title && (
              <>
                <Description sx={{ color: COLORS.secondary, fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                  }}
                >
                  {title}
                </Typography>
              </>
            )}
          </Box>
          {tooltipMessage && (
            <Tooltip title={tooltipMessage} arrow placement="left">
              <Box sx={{ cursor: "pointer", color: COLORS.textSecondary }}>
                <InfoOutlineIcon fontSize="small" />
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Filter Bar */}
        <FilterBar>
          {filters.map((filter, index) => (
            <FilterField key={index + 1}>{renderFilter(filter)}</FilterField>
          ))}

          <Box
            sx={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            <ActionButton
              variant="outlined"
              onClick={handleSubmit}
              disabled={
                !hasActiveFilters || !isDateRangeValid || isSubmitDisabled
              }
            >
              Submit
            </ActionButton>
            <ActionButton
              variant="outlined"
              onClick={handleDownloadClick}
              disabled={exportLoading}
            >
              {exportLoading ? <CircularProgress size={14} /> : "Download"}
            </ActionButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleExportClick("csv")}>
                📊 CSV
              </MenuItem>
              <MenuItem onClick={() => handleExportClick("pdf")}>
                📄 PDF
              </MenuItem>
            </Menu>
            <ActionButton
              variant="outlined"
              color="primary"
              onClick={handleReset}
              disabled={!hasActiveFilters}
            >
              Reset
            </ActionButton>
          </Box>
        </FilterBar>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                {columns.map((column, indx) => (
                  <TableCell
                    key={indx + 1}
                    align={column.align ?? "left"}
                    sx={{
                      minWidth: column.minWidth,
                      fontWeight: 700,
                      fontSize: "11px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: COLORS.textSecondary,
                      padding: "12px 16px",
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: COLORS.textSecondary,
                    padding: "12px 16px",
                    minWidth: 80,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {t("Actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange?.(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[10, 15, 20]}
          sx={{
            borderTop: `1px solid ${COLORS.border}`,
            "& .MuiTablePagination-toolbar": { minHeight: 44, px: "12px" },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "12.5px",
                color: COLORS.textSecondary,
              },
          }}
        />
      </StyledCard>
    </Box>
  );
}

export default React.memo(ReportTable);