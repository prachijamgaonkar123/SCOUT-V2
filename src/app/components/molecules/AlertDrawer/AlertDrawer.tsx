"use client";

import { useEffect, useState } from 'react';
import { Drawer, Box, Typography, IconButton, InputBase, Button } from '@mui/material';
import {
  Close,
  ScheduleOutlined,
  LocationOnOutlined,
  PhotoCameraOutlined,
  Check,
  FileDownloadOutlined,
} from '@mui/icons-material';
import { Alert, AlertStatus, formatTimestamp } from '../AlertsTable/AlertsTable';

interface AlertDrawerProps {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
  onStatusChange?: (alert: Alert, status: AlertStatus, note?: string) => void;
  onDownload?: (alert: Alert) => void;
}

const infoLabelSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: '#6B7280',
  mb: '4px',
};

const sectionLabelSx = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: '#6B7280',
  m: '22px 0 12px 0',
};

const actionBtnSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  p: '11px',
  borderRadius: '9px',
  fontSize: '13.5px',
  fontWeight: 700,
  textTransform: 'none',
  border: '1px solid #E5E7EB',
  bgcolor: '#FFFFFF',
  width: '100%',
};

export default function AlertDrawer({ open, onClose, alert, onStatusChange, onDownload }: AlertDrawerProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote('');
  }, [alert?.id]);

  if (!alert) return null;

  const isCritical = alert.severity === 'critical';
  const severityLabel = isCritical ? 'Critical' : 'Non-Critical';

  // Non-critical alerts are only ever resolved from the alert popup (one
  // step: detected → resolved). Critical alerts go through a 3-step flow —
  // acknowledge in the popup, then resolve here in the drawer with a
  // mandatory note.
  const timelineSteps = isCritical
    ? [
        { label: 'AI detected event', done: true },
        { label: 'Operator acknowledged', done: alert.status === 'acknowledged' || alert.status === 'resolved' },
        { label: 'Resolved', done: alert.status === 'resolved' },
      ]
    : [
        { label: 'AI detected event', done: true },
        { label: 'Resolved', done: alert.status === 'resolved' },
      ];

  // Kept only as a safety net — in the normal flow every critical alert
  // reaching this drawer has already been acknowledged in the popup.
  const canAcknowledge = isCritical && alert.status === 'new';
  const canResolve = isCritical && alert.status === 'acknowledged' && note.trim().length > 0;
  const notesEditable = isCritical && alert.status === 'acknowledged';
  const notesValue = alert.status === 'resolved' ? (alert.notes ?? '') : note;

  const handleAcknowledge = () => {
    onStatusChange?.(alert, 'acknowledged');
  };

  const handleResolve = () => {
    onStatusChange?.(alert, 'resolved', note.trim());
  };

  const handleDownload = () => {
    onDownload?.(alert);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1400 }}
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: '92vw',
          boxShadow: '-8px 0 24px rgba(0,0,0,.14)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          p: '22px 22px 16px 22px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '.03em' }}>
            {alert.id}
          </Typography>
          <Typography sx={{ fontSize: '19px', fontWeight: 800, color: '#111827', mt: '4px' }}>
            {alert.title}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              mt: '8px',
              color: isCritical ? '#DC2626' : '#475569',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: isCritical ? '#DC2626' : '#64748B',
              }}
            />
            {severityLabel}
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#6B7280', borderRadius: '6px' }}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: '20px 22px', flex: 1 }}>
        {/* Snapshot */}
        <Box
          sx={{
            height: 150,
            borderRadius: '10px',
            ...(alert.imageUrl
              ? {
                  backgroundImage: `url(${alert.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  background: 'repeating-linear-gradient(45deg,#F3F4F6,#F3F4F6 10px,#E9EAEE 10px,#E9EAEE 20px)',
                }),
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '6px',
            mb: '18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!alert.imageUrl && <PhotoCameraOutlined sx={{ fontSize: 28, color: '#9CA3AF', flex: 1, alignSelf: 'center' }} />}
          <Typography
            sx={{
              fontSize: '11.5px',
              fontWeight: 600,
              width: '100%',
              p: '4px 8px',
              color: alert.imageUrl ? '#FFFFFF' : '#6B7280',
              bgcolor: alert.imageUrl ? 'rgba(0,0,0,.45)' : 'transparent',
            }}
          >
            Snapshot · {alert.camera}
          </Typography>
        </Box>

        {/* Info grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Box>
            <Typography sx={infoLabelSx}>
              <ScheduleOutlined sx={{ fontSize: 14 }} />
              Detected
            </Typography>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
              {formatTimestamp(alert.timestamp)}
            </Typography>
          </Box>
          <Box>
            <Typography sx={infoLabelSx}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              Zone
            </Typography>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
              {alert.zone}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ ...infoLabelSx, mt: '14px' }}>
          <PhotoCameraOutlined sx={{ fontSize: 14 }} />
          Camera
        </Typography>
        <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
          {alert.camera}
        </Typography>

        {/* Timeline */}
        <Typography sx={sectionLabelSx}>Timeline</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', pl: '4px' }}>
          {timelineSteps.map((step, idx) => (
            <Box
              key={step.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                '&::after':
                  idx < timelineSteps.length - 1
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: '5px',
                        top: '16px',
                        width: '1px',
                        height: '20px',
                        bgcolor: '#E5E7EB',
                      }
                    : undefined,
              }}
            >
              <Box
                sx={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  bgcolor: step.done ? '#16A34A' : '#E5E7EB',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: step.done ? 700 : 600,
                  color: step.done ? '#111827' : '#9CA3AF',
                }}
              >
                {step.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Notes — critical alerts only; non-critical alerts are resolved
            directly from the popup and never collect a note here. */}
        {isCritical && (
          <>
            <Typography sx={sectionLabelSx}>Notes</Typography>
            <InputBase
              multiline
              minRows={3}
              placeholder="Add an operator note…"
              fullWidth
              value={notesValue}
              onChange={(e) => setNote(e.target.value)}
              disabled={!notesEditable}
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                p: '10px 12px',
                fontSize: '13px',
                color: '#111827',
                '&.Mui-focused': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 3px rgba(37,99,235,.12)',
                },
              }}
            />
          </>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          p: '16px 22px 22px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        {isCritical && canAcknowledge && (
          <Button
            onClick={handleAcknowledge}
            startIcon={<Check sx={{ fontSize: 17 }} />}
            sx={{
              ...actionBtnSx,
              borderColor: '#BFDBFE',
              color: '#1D4ED8',
              '&:hover': { bgcolor: '#EFF6FF' },
            }}
          >
            Acknowledge
          </Button>
        )}
        {isCritical && alert.status === 'acknowledged' && (
          <Button
            onClick={handleResolve}
            disabled={!canResolve}
            startIcon={<Check sx={{ fontSize: 17 }} />}
            sx={{
              ...actionBtnSx,
              borderColor: '#B8E6C9',
              color: '#0F7A38',
              '&:hover': { bgcolor: '#EAF9EF' },
              '&.Mui-disabled': { color: '#9CA3AF', borderColor: '#E5E7EB' },
            }}
          >
            Resolve
          </Button>
        )}
        <Button
          onClick={handleDownload}
          startIcon={<FileDownloadOutlined sx={{ fontSize: 17 }} />}
          sx={{
            ...actionBtnSx,
            color: '#6B7280',
            '&:hover': { bgcolor: '#F3F4F6' },
          }}
        >
          Download Evidence
        </Button>
      </Box>
    </Drawer>
  );
}
