"use client";

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { LocationOnOutlined } from '@mui/icons-material';
import ReportTable, {
  ReportColumn,
  ReportFilter,
} from '@/app/components/organisms/ReportTable/ReportTable';
import AlertDrawer from '../AlertDrawer/AlertDrawer';
import AlertsTableSnoozeControl from './AlertsTableSnoozeControl';
import { CATEGORY_LABEL, DASHBOARD_COLORS, UseCaseCategory } from '@/app/config/dashboardTheme';

// ---------- Type definitions (exported) ----------
export type AlertSeverity = 'critical' | 'non-critical';
// 'new' only ever exists before the alert has been triaged in the popup —
// the popup blocks the rest of the page until every alert has moved past
// it, so by the time this table is reachable, every row is either
// 'acknowledged' (critical, awaiting resolve in the drawer) or 'resolved'.
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  camera: string;
  zone: string;
  status: AlertStatus;
  category: UseCaseCategory;
  imageUrl?: string;
  imageFileName?: string;
  notes?: string;
}

// ---------- Category options (shared labels/colors with the rest of the dashboard) ----------
const categoryOrder: UseCaseCategory[] = ['surveillance', 'safety', 'operational', 'workforce'];
const categoryOptions = categoryOrder.map((key) => CATEGORY_LABEL[key]);

// ---------- Timestamp formatting ----------
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- Label maps (used for both display text and filter matching) ----------
const statusLabel: Record<AlertStatus, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
};

const severityLabel: Record<AlertSeverity, string> = {
  critical: 'Critical',
  'non-critical': 'Non-Critical',
};

const statusPillColor: Record<string, { color: string; bg: string }> = {
  New: { color: DASHBOARD_COLORS.error, bg: DASHBOARD_COLORS.errorTint },
  Acknowledged: { color: DASHBOARD_COLORS.warningText, bg: DASHBOARD_COLORS.warningTint },
  Resolved: { color: DASHBOARD_COLORS.success, bg: DASHBOARD_COLORS.successTint },
};

const severityDotColor: Record<string, string> = {
  Critical: DASHBOARD_COLORS.error,
  'Non-Critical': DASHBOARD_COLORS.textSecondary,
};

// ReportTable's default export is wrapped in React.memo, which erases its
// generic type parameter — every ReportTable call site in this app types
// columns/filters/row-handlers against this Record shape directly instead
// of a named interface, to stay structurally compatible.
type TableRow = Record<string, string | number | boolean>;

// ---------- Row shape rendered by ReportTable ----------
interface AlertRow {
  [key: string]: string;
  alertId: string;
  timestamp: string;
  severity: string;
  alert: string;
  camera: string;
  zone: string;
  status: string;
  // Filter-only fields (not rendered as columns) — ReportTable's date-range
  // constraint logic keys off exactly these ids.
  startDate: string;
  endDate: string;
}

const columns: ReportColumn<TableRow>[] = [
  {
    id: 'timestamp',
    label: 'Timestamp',
    minWidth: 140,
    render: (value) => (
      <Typography
        sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '12.5px', color: DASHBOARD_COLORS.textSecondary }}
      >
        {String(value)}
      </Typography>
    ),
  },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    render: (value) => {
      const label = String(value);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: severityDotColor[label] }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: severityDotColor[label] }} />
          {label}
        </Box>
      );
    },
  },
  { id: 'alert', label: 'Alert', minWidth: 220 },
  {
    id: 'camera',
    label: 'Camera',
    minWidth: 100,
    render: (value) => (
      <Box
        component="span"
        sx={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '12px',
          fontWeight: 600,
          bgcolor: DASHBOARD_COLORS.bg,
          border: `1px solid ${DASHBOARD_COLORS.border}`,
          color: DASHBOARD_COLORS.textSecondary,
          p: '3px 8px',
          borderRadius: '6px',
        }}
      >
        {String(value)}
      </Box>
    ),
  },
  {
    id: 'zone',
    label: 'Zone',
    minWidth: 120,
    render: (value) => (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: DASHBOARD_COLORS.textSecondary, fontWeight: 500 }}>
        <LocationOnOutlined sx={{ fontSize: 15, color: DASHBOARD_COLORS.textSecondary }} />
        {String(value)}
      </Box>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    render: (value) => {
      const label = String(value);
      const colors = statusPillColor[label];
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 700,
            p: '3px 10px',
            borderRadius: '20px',
            bgcolor: colors?.bg,
            color: colors?.color,
          }}
        >
          {label}
        </Box>
      );
    },
  },
];

// ---------- Component ----------
interface AlertsTableProps {
  alerts: Alert[];
  onStatusChange: (alert: Alert, status: AlertStatus, note?: string) => void;
}

export default function AlertsTable({ alerts: mockAlerts, onStatusChange }: AlertsTableProps) {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const selectedAlert = useMemo(
    () => mockAlerts.find((a) => a.id === selectedAlertId) ?? null,
    [mockAlerts, selectedAlertId],
  );

  const uniqueZones = useMemo(() => Array.from(new Set(mockAlerts.map((a) => a.zone))).sort(), [mockAlerts]);
  const uniqueCameras = useMemo(() => Array.from(new Set(mockAlerts.map((a) => a.camera))).sort(), [mockAlerts]);
  const uniqueAlertTitles = useMemo(() => Array.from(new Set(mockAlerts.map((a) => a.title))).sort(), [mockAlerts]);

  const filters: ReportFilter<TableRow>[] = [
    { id: 'alert', label: 'Alert', type: 'select', options: uniqueAlertTitles },
    { id: 'camera', label: 'Camera', type: 'select', options: uniqueCameras },
    { id: 'zone', label: 'Zone', type: 'select', options: uniqueZones },
    { id: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'Non-Critical'] },
    { id: 'status', label: 'Status', type: 'select', options: ['Acknowledged', 'Resolved'] },
    { id: 'category', label: 'Category', type: 'select', options: categoryOptions },
    { id: 'startDate', label: 'Start date', type: 'datetime' },
    { id: 'endDate', label: 'End date', type: 'datetime' },
  ];

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter((alert) => {
      if (appliedFilters.category && CATEGORY_LABEL[alert.category] !== appliedFilters.category) return false;
      if (appliedFilters.alert && alert.title !== appliedFilters.alert) return false;
      if (appliedFilters.camera && alert.camera !== appliedFilters.camera) return false;
      if (appliedFilters.zone && alert.zone !== appliedFilters.zone) return false;
      if (appliedFilters.severity && severityLabel[alert.severity] !== appliedFilters.severity) return false;
      if (appliedFilters.status && statusLabel[alert.status] !== appliedFilters.status) return false;
      const ts = dayjs(alert.timestamp);
      if (appliedFilters.startDate && ts.isBefore(dayjs(appliedFilters.startDate))) return false;
      if (appliedFilters.endDate && ts.isAfter(dayjs(appliedFilters.endDate))) return false;
      return true;
    });
  }, [mockAlerts, appliedFilters]);

  const rows: AlertRow[] = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAlerts.slice(start, start + rowsPerPage).map((alert) => ({
      alertId: alert.id,
      timestamp: formatTimestamp(alert.timestamp),
      severity: severityLabel[alert.severity],
      alert: alert.title,
      camera: alert.camera,
      zone: alert.zone,
      status: statusLabel[alert.status],
      startDate: '',
      endDate: '',
    }));
  }, [filteredAlerts, page, rowsPerPage]);

  const handleView = (row: TableRow) => {
    setSelectedAlertId(row.alertId as string);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedAlertId(null);
  };

  const handleDownload = (alert: Alert) => {
    console.log('Download evidence for', alert.id);
  };

  const handleSubmit = (nextFilters: Record<string, string>) => {
    setAppliedFilters(nextFilters);
    setPage(0);
  };

  const handleReset = () => {
    setAppliedFilters({});
    setPage(0);
  };

  const exportColumns = ['Timestamp', 'Severity', 'Alert', 'Camera', 'Zone', 'Status'];
  const exportRows = () =>
    filteredAlerts.map((alert) => [
      formatTimestamp(alert.timestamp),
      severityLabel[alert.severity],
      alert.title,
      alert.camera,
      alert.zone,
      statusLabel[alert.status],
    ]);

  const handleDownloadCsv = () => {
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [exportColumns, ...exportRows()]
      .map((row) => row.map(escape).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new JsPDF();
    doc.setFontSize(14);
    doc.text('Active Alerts', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Exported ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, 14, 22);
    autoTable(doc, {
      head: [exportColumns],
      body: exportRows(),
      startY: 28,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save(`alerts_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExportLoading(true);
    try {
      if (format === 'csv') handleDownloadCsv();
      else await handleDownloadPdf();
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>

      <ReportTable
        title="Total Alerts"
        headerAction={<AlertsTableSnoozeControl />}
        columns={columns}
        data={rows}
        totalCount={filteredAlerts.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(nextRows) => {
          setRowsPerPage(nextRows);
          setPage(0);
        }}
        downloadFileName="alerts"
        filters={filters}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onExport={handleExport}
        exportLoading={exportLoading}
        onRowClick={handleView}
        hideActions
      />
      <AlertDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        alert={selectedAlert}
        onStatusChange={onStatusChange}
        onDownload={handleDownload}
      />
    </>
  );
}
