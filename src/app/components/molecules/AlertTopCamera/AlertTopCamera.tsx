"use client";

import { Card, Box, Typography } from '@mui/material';
import { PhotoCameraOutlined } from '@mui/icons-material';
import { useAlerts } from '@/Providers/AlertsProvider';
import { getTopCameras } from '@/app/(protectedRoutes)/alertsPage/AlertsMockData';

export default function TopCameras() {
  const { alerts } = useAlerts();
  const cameras = getTopCameras(alerts, 4);

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 1px 3px 1px rgba(0,0,0,.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px 4px 24px',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: '#111827',
          }}
        >
          Top Cameras
        </Typography>
        <Typography sx={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>
          by alert volume
        </Typography>
      </Box>

      {/* List */}
      <Box
        sx={{
          p: '6px 20px 18px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {cameras.map((cam, idx) => (
          <Box
            key={cam.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              py: '10px',
              borderBottom: idx < cameras.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                bgcolor: '#FDECEC',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PhotoCameraOutlined sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#111827' }}>
                {cam.id}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: '1px' }}>
                {cam.zone}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: '#FDECEC',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 800,
                px: '9px',
                py: '2px',
                borderRadius: '20px',
              }}
            >
              {cam.count}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
