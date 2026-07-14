'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import RoiSelectionModal from '../ROISelectionModel/RoiSelectionModal';
import UseCaseConfigurationDialog, {
  UseCaseConfigurationData,
  CanteenSession
} from '../UseCaseConfigurationDialog/UseCaseConfigurationDialog';

import {
  useGetUsecasesQuery,
  useAssignCamerasMutation,
  useUnassignCameraMutation,
  useLazyGetCameraAssignmentsQuery,
  useConfigureUsecaseMutation,
} from '@/app/(protectedRoutes)/(settings)/(configurator)/useCaseManager/UseCaseManagerAPI';
import {
  useLazyGetRoiQuery,
  useSaveRoiMutation,
} from '@/app/(protectedRoutes)/(settings)/(configurator)/cameraManagement/RoiApi';
import {
  mockUsecasesResponse,
  mockAssignmentMap,
} from '@/app/(protectedRoutes)/(settings)/(configurator)/useCaseManager/useCaseManagerMockData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';


import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Chip,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  RadioButtonUnchecked as ROIIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { ROIShape } from '@/app/types/roi';

interface ROIData {
  configured: boolean;
  shapes?: ROIShape[];
  coordinates?: { x: number; y: number; width: number; height: number }[];
}

interface ConfigurationData {
  tuned: boolean;

  fpsRate?: number;
  fpsUnit?: 'second' | 'minute' | 'hour';

  inferenceMode?: '24_hours' | 'custom';

  startTime?: string;
  endTime?: string;

  canteenSchedule?: {
    sessionName: string;
    startTime: string;
    endTime: string;
  }[];
}
interface ConfigureUsecasePayload {
  cameraMapperId: string;

  fpsRate: number;
  fpsUnit: 'second' | 'minute' | 'hour';

  inferenceMode: '24_hours' | 'custom';

  startTime?: string;
  endTime?: string;

  canteenSchedule?: CanteenSession[];
}

interface AIConfig {
  useCases: string[];
  roiData: Record<string, ROIData>;
  configure: Record<string, ConfigurationData>;
  enabled: boolean;
  viewName?: string;

}

interface CameraData {
  id: string;
  ipAddress: string;
  username: string;
  password: string;
  port: string;
  make: string;
  cameraname: string;
  zone?: string;
  location?: string;
  rtspStream: string;
  status: 'connected' | 'failed' | 'pending';
  aiConfig?: AIConfig;
}

interface AIConfigurationStepProps {
  camera: CameraData;
  onSave: (aiConfig: AIConfig) => void;
  onBack: () => void;
  tenantId: string;
}

interface UseCaseData {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  roiConfigured: boolean;
  roiShapes?: ROIShape[];
  cameraMapperId?: string;
  configureUsecase: boolean;
  enabled: boolean;
  labels: string[];
  is_threshold?: boolean;
  modelThreshold?: number | null;
  configure?: ConfigurationData;
}


type FrameStatus = 'idle' | 'loading' | 'loaded' | 'error';

const MAX_RETRIES = 3;

const AIConfigurationStep: React.FC<AIConfigurationStepProps> = ({
  camera,
  onSave,
  onBack,
  tenantId,
}) => {

  // RTK Query hooks
  const { data: useCasesResponseApi, isLoading: loadingUseCasesApi } = useGetUsecasesQuery(undefined, {
    skip: USE_MOCK,
  });
  const useCasesResponse = USE_MOCK ? mockUsecasesResponse : useCasesResponseApi;
  const loadingUseCases = USE_MOCK ? false : loadingUseCasesApi;
  const [assignCameras] = useAssignCamerasMutation();
  const [unassignCamera] = useUnassignCameraMutation();
  const [configureUsecaseMutation] =
    useConfigureUsecaseMutation();
  const [getCameraAssignments] = useLazyGetCameraAssignmentsQuery();

  // ROI RTK Query hooks
  const [getRoi] = useLazyGetRoiQuery();
  const [saveRoi, { isLoading: isSavingRoi }] = useSaveRoiMutation();

  const [useCases, setUseCases] = useState<UseCaseData[]>([]);

  const loadAssignments = React.useCallback(
    async (mapped: UseCaseData[]): Promise<UseCaseData[]> => {
      if (USE_MOCK) {
        return mapped.map((uc) => ({
          ...uc,
          selected: mockAssignmentMap[uc.id]?.includes(camera.id) ?? false,
          cameraMapperId: `mock-mapper-${uc.id}`,
        }));
      }
      const res = await getCameraAssignments(camera.id).unwrap();
      if (!Array.isArray(res)) return mapped;
      return mapped.map((uc) => {

        const assignment = res.find(
          (a: { usecaseId: string }) => a.usecaseId === uc.id
        );

        return {
          ...uc,

          selected: !!assignment,

          cameraMapperId:
            assignment?.cameraMapperId,

          configureUsecase:
            !!(
              assignment?.fpsRate &&
              assignment?.fpsUnit &&
              assignment?.inferenceMode
            ),

          configure: assignment
            ? {
              tuned: !!assignment.fpsRate,
              fpsRate: assignment.fpsRate,
              fpsUnit: assignment.fpsUnit,
              inferenceMode: assignment.inferenceMode,
              startTime: assignment.startTime,
              endTime: assignment.endTime,
              canteenSchedule: assignment.canteenSchedule,
            }
            : undefined,
        };
      });
    },
    [camera.id, getCameraAssignments]
  );

  const loadRoiForUseCases = React.useCallback(
    async (useCases: UseCaseData[]): Promise<UseCaseData[]> => {
      if (USE_MOCK) return useCases;
      return Promise.all(
        useCases.map(async (uc) => {
          if (!uc.selected) return uc;
          try {
            const res = await getRoi({ cameraId: camera.id, usecaseId: uc.id }).unwrap();
            return {
              ...uc,
              roiConfigured: res.rois.length > 0,
              roiShapes: res.rois,
              modelThreshold: res.modelThreshold ?? null,
            };
          } catch {
            return uc;
          }
        })
      );
    },
    [camera.id, getRoi]
  );

  useEffect(() => {
    if (loadingUseCases || !useCasesResponse || !Array.isArray(useCasesResponse)) return;

    const run = async () => {
      const mapped: UseCaseData[] = useCasesResponse.map((uc) => ({
        id: uc.id,
        name: uc.usecaseName,
        description: uc.description ?? '',
        selected: false,
        roiConfigured: false,
        configureUsecase: false,
        enabled: false,
        roiShapes: [],
        labels: uc.labels ?? [],
        is_threshold: uc.is_threshold ?? false,
        modelThreshold: null,
      }));

      try {
        const withAssignments = await loadAssignments(mapped);
        const withROI = await loadRoiForUseCases(withAssignments);
        setUseCases(withROI);
      } catch (err) {
        console.error('Failed to load assignments', err);
        setUseCases(mapped);
      }
    };

    void run();
  }, [loadingUseCases, useCasesResponse, loadAssignments, loadRoiForUseCases]);

  const [selectedViewCase, setSelectedViewCase] = useState<string | null>(null);
  const [viewName, setViewName] = useState('');
  const [showCameraView, setShowCameraView] = useState(true);

  // Frame state — fetch once on mount, retry on failure only, never poll
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [frameStatus, setFrameStatus] = useState<FrameStatus>('idle');
  const [frameError, setFrameError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ROI Modal state
  const [roiModalOpen, setRoiModalOpen] = useState(false);
  const [currentUseCaseForROI, setCurrentUseCaseForROI] = useState<string | null>(null);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentUseCaseForConfig, setCurrentUseCaseForConfig] = useState<string | null>(null);

  // Loading and notification states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const [useCaseConfigurations, setUseCaseConfigurations] =
    useState<Record<string, ConfigurationData>>({});

  const getCameraFeedUrl = useCallback(() => {
    if (USE_MOCK || !camera?.id || !tenantId) return '/img/siteimage.jpg';
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/configurator/camera-manager/${tenantId}/${camera.id}/frame`;
  }, [camera?.id, tenantId]);

  const fetchFrame = useCallback(() => {
    setFrameStatus('loading');
    setFrameError(null);
    setFrameUrl(`${getCameraFeedUrl()}?_t=${Date.now()}`);
  }, [getCameraFeedUrl]);

  const handleFrameLoad = useCallback(() => {
    retryCountRef.current = 0;
    setFrameStatus('loaded');
    setFrameError(null);
  }, []);

  const handleFrameError = useCallback(() => {
    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1;
      const delayMs = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
      console.warn(`Camera frame failed. Retry ${retryCountRef.current}/${MAX_RETRIES} in ${delayMs / 1000}s`);
      setFrameStatus('loading');
      retryTimerRef.current = setTimeout(() => {
        setFrameUrl(`${getCameraFeedUrl()}?_t=${Date.now()}`);
      }, delayMs);
    } else {
      console.error('Camera frame failed after max retries.');
      setFrameStatus('error');
      setFrameError('Unable to load camera frame. Camera may be offline.');
    }
  }, [getCameraFeedUrl]);

  // Fetch once when the view is shown; clean up on hide
  useEffect(() => {
    if (!showCameraView) {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryCountRef.current = 0;
      setFrameUrl(null);
      setFrameStatus('idle');
      setFrameError(null);
      return;
    }
    retryCountRef.current = 0;
    fetchFrame();
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [showCameraView, fetchFrame]);

  const handleManualRefresh = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = 0;
    fetchFrame();
  }, [fetchFrame]);

  const renderCameraContent = () => {
    if (!showCameraView) {
      return (
        <Box sx={{ textAlign: 'center', color: 'grey.500' }}>
          <Typography variant="body2">
            Click &apos;Show Camera View&apos; to display feed
          </Typography>
        </Box>
      );
    }

    if (frameStatus === 'error') {
      return (
        <Box sx={{ textAlign: 'center', color: 'grey.400' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>{frameError}</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleManualRefresh}
            sx={{ color: 'grey.300', borderColor: 'grey.600' }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return (
      <>
        {/* Spinner while loading / retrying */}
        {frameStatus === 'loading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1, color: 'grey.400' }}>
              Loading camera feed...
            </Typography>
          </Box>
        )}

        {/* Image — hidden until loaded so no broken-image flash */}
        {frameUrl && (
          <Box
            component="img"
            src={frameUrl}
            alt="Camera Frame"
            onLoad={handleFrameLoad}
            onError={handleFrameError}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 1,
              display: frameStatus === 'loaded' ? 'block' : 'none',
            }}
          />
        )}
      </>
    );
  };

  const handleUseCaseSelect = async (usecaseId: string) => {
    const useCase = useCases.find(uc => uc.id === usecaseId);
    const isSelected = !useCase?.selected;

    setUseCases(prev =>
      prev.map(uc => uc.id === usecaseId ? { ...uc, selected: isSelected } : uc)
    );

    if (USE_MOCK) {
      setSnackbar({
        open: true,
        severity: 'success',
        message: isSelected ? 'Camera assigned to usecase' : 'Camera unassigned',
      });
      return;
    }

    try {
      if (isSelected) {
        await assignCameras({ usecaseId, cameraIds: [camera.id] }).unwrap();
      } else {
        await unassignCamera({ usecaseId, cameraId: camera.id }).unwrap();
      }
      setSnackbar({
        open: true,
        severity: 'success',
        message: isSelected ? 'Camera assigned to usecase' : 'Camera unassigned',
      });
    } catch (error) {
      console.error(error);
      setUseCases(prev =>
        prev.map(uc => uc.id === usecaseId ? { ...uc, selected: !isSelected } : uc)
      );
      setSnackbar({ open: true, severity: 'error', message: 'Failed to update assignment' });
    }
  };

  const handleAddROI = async (useCaseId: string) => {
    setCurrentUseCaseForROI(useCaseId);
    if (USE_MOCK) {
      setRoiModalOpen(true);
      return;
    }
    try {
      const res = await getRoi({ cameraId: camera.id, usecaseId: useCaseId }).unwrap();
      setUseCases(prev =>
        prev.map(uc =>
          uc.id === useCaseId
            ? { ...uc, roiShapes: res.rois, roiConfigured: res.rois.length > 0, modelThreshold: res.modelThreshold ?? null }
            : uc
        )
      );
    } catch {
      // No ROI yet — open empty canvas
    }
    setRoiModalOpen(true);
  };

  const handleROISave = async (roiShapes: ROIShape[]) => {
    if (!currentUseCaseForROI) return;

    if (USE_MOCK) {
      setUseCases(prev =>
        prev.map(uc =>
          uc.id === currentUseCaseForROI
            ? { ...uc, roiConfigured: roiShapes.length > 0, roiShapes }
            : uc
        )
      );
      setSnackbar({ open: true, message: 'Mock ROI saved.', severity: 'success' });
      setRoiModalOpen(false);
      setCurrentUseCaseForROI(null);
      return;
    }

    try {
      setLoading(true);
      const currentUC = useCases.find(u => u.id === currentUseCaseForROI);
      await saveRoi({
        cameraId: camera.id,
        usecaseId: currentUseCaseForROI,
        modelThreshold: currentUC?.modelThreshold ?? undefined,
        rois: roiShapes.map(r => ({
          type: r.type, labels:r.labels, mode: r.mode, color: r.color, points: r.points,
        })),
      }).unwrap();

      const rois = await getRoi({ cameraId: camera.id, usecaseId: currentUseCaseForROI }).unwrap();
      setUseCases(prev =>
        prev.map(uc =>
          uc.id === currentUseCaseForROI
            ? { ...uc, roiConfigured: rois.rois.length > 0, roiShapes: rois.rois, modelThreshold: rois.modelThreshold ?? null }
            : uc
        )
      );
      setSnackbar({ open: true, message: 'ROI saved successfully', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to save ROI', severity: 'error' });
    } finally {
      setLoading(false);
      setRoiModalOpen(false);
      setCurrentUseCaseForROI(null);
    }
  };

  const handleROIClose = () => {
    setRoiModalOpen(false);
    setCurrentUseCaseForROI(null);
  };

  const handleCamera_Usecase_Configure = (useCaseId: string) => {
    setCurrentUseCaseForConfig(useCaseId);
    setConfigDialogOpen(true);
  };


  const handleSaveUsecaseConfiguration = async (
    config: UseCaseConfigurationData
  ) => {

    if (!currentUseCaseForConfig) return;

    if (USE_MOCK) {
      setUseCaseConfigurations(prev => ({
        ...prev,
        [currentUseCaseForConfig]: { tuned: true, ...config },
      }));
      setUseCases(prev =>
        prev.map(useCase =>
          useCase.id === currentUseCaseForConfig
            ? { ...useCase, configureUsecase: true }
            : useCase
        )
      );
      setConfigDialogOpen(false);
      setSnackbar({ open: true, severity: 'success', message: 'Mock use case configuration saved.' });
      return;
    }

    try {

      const currentUseCase = useCases.find(
        uc => uc.id === currentUseCaseForConfig
      );

      if (!currentUseCase?.cameraMapperId) {
        throw new Error(
          'Camera mapper ID not found'
        );
      }

      const payload: ConfigureUsecasePayload = {
        cameraMapperId: currentUseCase.cameraMapperId,

        fpsRate: config.fpsRate,

        fpsUnit: config.fpsUnit,

        inferenceMode: config.inferenceMode,

        startTime:
          config.inferenceMode === 'custom'
            ? config.startTime
            : undefined,

        endTime:
          config.inferenceMode === 'custom'
            ? config.endTime
            : undefined,
      };

      if (currentUseCase.id === 'SUC018') {
        payload.canteenSchedule = config.canteenSchedule;
      }

      await configureUsecaseMutation(payload).unwrap();

      setUseCaseConfigurations(prev => ({
        ...prev,
        [currentUseCaseForConfig]: {
          tuned: true,
          ...config,
        },
      }));

      setUseCases(prev =>
        prev.map(useCase =>
          useCase.id === currentUseCaseForConfig
            ? {
              ...useCase,
              configureUsecase: true,
            }
            : useCase
        )
      );

      setConfigDialogOpen(false);

      setSnackbar({
        open: true,
        severity: 'success',
        message:
          'Use case configured successfully',
      });

    } catch (error) {

      console.error(error);

      setSnackbar({
        open: true,
        severity: 'error',
        message:
          'Failed to configure use case',
      });
    }
  };

  const handleSubmit = () => {
    const aiConfig: AIConfig = {
      useCases: useCases.filter(uc => uc.selected).map(uc => uc.id),
      roiData: useCases.reduce((acc, uc) => {
        if (uc.roiConfigured) acc[uc.id] = { configured: true, shapes: uc.roiShapes };
        return acc;
      }, {} as Record<string, ROIData>),
      configure: useCaseConfigurations,
      enabled: useCases.some(uc => uc.selected),
      viewName: viewName ?? selectedViewCase ?? '',
    };
    onSave(aiConfig);
  };

  function handleCloseSnackbar() {
    setSnackbar(prev => ({ ...prev, open: false }));
  }

  return (
    <Box sx={{ p: 1, minHeight: 500, position: 'relative' }}>
      {(loading || isSavingRoi) && (
        <Box
          sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255,255,255,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Saving ROI configuration...</Typography>
          </Box>
        </Box>
      )}

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          {/* Camera info + controls */}
          <Card variant="outlined" sx={{ mb: 1.5 }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="primary" />
                Camera Configuration
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Camera Name:</strong> {camera.cameraname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Camera ID:</strong> {camera.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Zone:</strong> {camera.zone ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Location:</strong> {camera.location ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>IP Address:</strong> {camera.ipAddress}:{camera.port}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Connection Type:</strong> {camera.make}
                </Typography>
              </Box>

              <TextField
                label="View Name"
                value={viewName}
                onChange={e => setViewName(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter view name for this camera"
                sx={{ mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowCameraView(!showCameraView)}
                  fullWidth
                  size="small"
                >
                  {showCameraView ? 'Hide' : 'Show'} Camera View
                </Button>
                {showCameraView && frameStatus !== 'loading' && (
                  <Button
                    variant="outlined"
                    onClick={handleManualRefresh}
                    size="small"
                    sx={{ minWidth: 'auto', px: 1.5 }}
                    title="Refresh frame"
                  >
                    <RefreshIcon fontSize="small" />
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/*
            Frame card — height is driven purely by the 16:9 aspect-ratio box.
            No minHeight, no fixed px — zero blank space above or below the image.
          */}
          <Card variant="outlined" sx={{ bgcolor: 'grey.900', overflow: 'hidden' }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16 / 9',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {renderCameraContent()}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                AI Use Cases Configuration
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Select use cases, configure ROI (saved to database), fine-tune settings, and enable/disable detection.
              </Alert>

              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {loadingUseCases ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading use cases...</Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ height: '480px', overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '80px', bgcolor: 'background.paper' }}>Select</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: '300px', bgcolor: 'background.paper' }}>Use Case</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '120px', bgcolor: 'background.paper' }}>Add ROI</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '120px', bgcolor: 'background.paper' }}>Configure</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '80px', bgcolor: 'background.paper' }}>View</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {useCases.map((useCase) => (
                          <TableRow key={useCase.id} hover>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={useCase.selected}
                                    onChange={() => handleUseCaseSelect(useCase.id)}
                                    size="small"
                                  />
                                }
                                label=""
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={540}>{useCase.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{useCase.description}</Typography>
                                {useCase.roiConfigured && useCase.roiShapes && (
                                  <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                      label={`${useCase.roiShapes.length} ROI(s) in DB`}
                                      size="small" color="success" variant="outlined"
                                    />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant={useCase.roiConfigured ? 'contained' : 'outlined'}
                                onClick={() => handleAddROI(useCase.id)}
                                disabled={!useCase.selected}
                                startIcon={useCase.roiConfigured ? <CheckCircleIcon /> : <ROIIcon />}
                                color={useCase.roiConfigured ? 'success' : 'primary'}
                                sx={{ minWidth: '90px' }}
                              >
                                {useCase.roiConfigured ? 'Edit ROI' : 'Add ROI'}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant={useCase.configureUsecase ? 'contained' : 'outlined'}
                                onClick={() => handleCamera_Usecase_Configure(useCase.id)}
                                disabled={!useCase.selected}
                                startIcon={useCase.configureUsecase ? <CheckCircleIcon /> : <TuneIcon />}
                                color={useCase.configureUsecase ? 'success' : 'primary'}
                                sx={{ minWidth: '90px' }}
                              >
                                {useCase.configureUsecase ? 'Configured' : 'Configure'}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Radio
                                    checked={selectedViewCase === useCase.id}
                                    onChange={() => setSelectedViewCase(useCase.id)}
                                    disabled={!useCase.selected}
                                    size="small"
                                    color="primary"
                                  />
                                }
                                label=""
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: 2, py: 1, bgcolor: 'action.hover', borderRadius: 1, mb: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Selected: {useCases.filter(uc => uc.selected).length} of {useCases.length} use cases
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ROI in DB: {useCases.filter(uc => uc.roiConfigured).length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} color="inherit" variant="outlined">
          Back to Camera List
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* <Button variant="outlined" color="inherit">Save Configuration</Button> */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!useCases.some(uc => uc.selected)}
          >
            Submit
          </Button>
        </Box>
      </Box>

      <RoiSelectionModal
        key={`${camera.id}-${currentUseCaseForROI}`}
        open={roiModalOpen}
        onClose={handleROIClose}
        cameraFeedUrl={getCameraFeedUrl()}
        useCaseName={useCases.find(uc => uc.id === currentUseCaseForROI)?.name ?? ''}
        existingROI={useCases.find(uc => uc.id === currentUseCaseForROI)?.roiShapes ?? []}
        onSave={handleROISave}
        labels={useCases.find(u => u.id === currentUseCaseForROI)?.labels ?? []}
        enableThreshold={useCases.find(u => u.id === currentUseCaseForROI)?.is_threshold ?? false}
        thresholdValue={useCases.find(u => u.id === currentUseCaseForROI)?.modelThreshold ?? null}
        onThresholdChange={(value) => {
          setUseCases(prev =>
            prev.map(u => u.id === currentUseCaseForROI ? { ...u, modelThreshold: value } : u)
          );
        }}
      />

      <UseCaseConfigurationDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveUsecaseConfiguration}
        useCaseName={
          useCases.find(
            uc => uc.id === currentUseCaseForConfig
          )?.name ?? ''
        }
        useCaseId={
          useCases.find(
            uc => uc.id === currentUseCaseForConfig
          )?.id ?? ''
        }
        initialData={
          useCases.find(
            uc => uc.id === currentUseCaseForConfig
          )?.configure as UseCaseConfigurationData
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIConfigurationStep;
