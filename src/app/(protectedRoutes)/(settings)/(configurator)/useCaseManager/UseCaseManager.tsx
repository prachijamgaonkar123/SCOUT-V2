"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Category as CategoryIcon,
} from "@mui/icons-material";
import { UseCase } from "@/app/types/useCaseManager";
import {
  useGetUsecasesQuery,
  useGetCamerasQuery,
  useAssignCamerasMutation,
  useLazyGetAssignmentsQuery,
} from "./UseCaseManagerAPI";

import {
  UseCaseList,
  CameraSelectionDrawer,
} from "@/app/components/organisms/configurator/use-case-manager";
import { useDispatch } from "react-redux";
import { showToast } from "@/app/store/slices/toasterSlice";
import {
  mockUsecasesResponse,
  mockCamerasResponse,
  mockAssignmentMap,
} from "./useCaseManagerMockData";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const UseCaseManager: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchAssignments] = useLazyGetAssignmentsQuery();
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string[]>>(
    USE_MOCK ? mockAssignmentMap : {}
  );


  const loadAssignmentsForUseCases = useCallback(
    async (useCases: Array<{ id: string }>): Promise<void> => {
      const updates: Record<string, string[]> = {};

      await Promise.all(
        useCases.map(async (uc) => {
          try {
            const res = await fetchAssignments(uc.id).unwrap();
            updates[uc.id] = Array.isArray(res)
              ? res.map((a) => a.cameraId)
              : [];
          } catch {
            updates[uc.id] = [];
          }
        })
      );

      setAssignmentMap((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [fetchAssignments] // 👈 correct dependency
  );

  // RTK Query hooks
  const {
    data: useCasesResponseApi,
    isLoading: isLoadingUseCasesApi,
    error: useCasesError,
  } = useGetUsecasesQuery(undefined, { skip: USE_MOCK });
  const useCasesResponse = USE_MOCK ? mockUsecasesResponse : useCasesResponseApi;
  const isLoadingUseCases = USE_MOCK ? false : isLoadingUseCasesApi;

  useEffect(() => {
    if (USE_MOCK) return;
    if (!Array.isArray(useCasesResponse)) return;
    void loadAssignmentsForUseCases(useCasesResponse);
  }, [useCasesResponse, loadAssignmentsForUseCases]);



  const {
    data: camerasResponseApi,
    isLoading: isLoadingCamerasApi,
  } = useGetCamerasQuery(undefined, {
    skip: USE_MOCK || !drawerOpen, // Only fetch when drawer opens
  });
  const camerasResponse = USE_MOCK ? mockCamerasResponse : camerasResponseApi;
  const isLoadingCameras = USE_MOCK ? false : isLoadingCamerasApi;

  const [assignCameras, { isLoading: isAssigning }] = useAssignCamerasMutation();

  // Process use cases data
  const useCases = useMemo(() => {
    if (!Array.isArray(useCasesResponse)) return [];

    return useCasesResponse.map((uc) => ({
      id: uc.id,
      name: uc.usecaseName,
      description: uc.description ?? "",
      category: "AI",
      enabled: true,
      assignedCameraIds: assignmentMap[uc.id] ?? [],

    }));
  }, [useCasesResponse, assignmentMap]);

  // Process cameras data
  const cameras = useMemo(() => {
    if (!Array.isArray(camerasResponse)) return [];

    return camerasResponse.map((cam) => ({
      id: cam.id,
      name: cam.cameraName,
      position: cam.cameraZone ?? "",
      location: cam.cameraZone ?? "",
      ipAddress: cam.cameraIp,
      port: String(cam.RTSPport),
      make: cam.connectionType ?? "",
      status: "connected" as const,
    }));
  }, [camerasResponse]);


  // Handle save camera assignments
  const handleSaveCameraAssignments = async (useCaseId: string, selectedCameraIds: string[]) => {
    if (USE_MOCK) {
      setAssignmentMap((prev) => ({ ...prev, [useCaseId]: selectedCameraIds }));
      dispatch(showToast({ id: crypto.randomUUID(), message: "Mock camera assignments saved.", severity: "success" }));
      handleCloseDrawer();
      return;
    }

    try {
      await assignCameras({
        usecaseId: useCaseId,
        cameraIds: selectedCameraIds
      }).unwrap();

      const res = await fetchAssignments(useCaseId).unwrap();

      setAssignmentMap((prev) => ({
        ...prev,
        [useCaseId]: Array.isArray(res) ? res.map(a => a.cameraId) : [],
      }));



      console.log("Saved camera assignments:", {
        useCaseId,
        selectedCameraIds,
      });

      // Close drawer on success
      handleCloseDrawer();
    } catch (err) {
      console.error("Error saving Camera Assignment", err);
      setError("Failed to save camera assignments. Please try again.");
    }
  };

  // Handle configure cameras
  const handleConfigureCameras = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setDrawerOpen(true);
    // Cameras will auto-fetch when drawer opens (skip: !drawerOpen)
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUseCase(null);
  };

  // Render content based on loading/error states
  const renderContent = () => {
    if (isLoadingUseCases) {
      return (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={100}
                sx={{ flex: 1, borderRadius: 2 }}
              />
            ))}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={280}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </Box>
      );
    }

    if (useCasesError) {
      return (
        <Alert severity="error">
          Failed to load use cases. Please try again later.
        </Alert>
      );
    }

    if (useCases.length === 0) {
      return (
        /* Empty State */
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: "background.default",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "warning.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CategoryIcon sx={{ fontSize: 40, color: "warning.main" }} />
          </Box>

          <Typography variant="h5" gutterBottom fontWeight={600}>
            No Use Cases Available
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            Your organizations license does not have any use cases configured yet.
            Please contact your administrator or check your license details.
          </Typography>

          <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
            Use cases are configured during organization onboarding and depend on your
            selected license tier. Contact support for more information.
          </Alert>
        </Paper>
      );
    }

    return (
      /* Use Case List */
      <UseCaseList
        useCases={useCases}
        onConfigureCameras={handleConfigureCameras}
        isLoading={isLoadingUseCases}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        
        <Typography variant="body1" color="text.secondary">
          Configure and assign cameras to AI use cases based on your organization&apos;s
          license. Select cameras from Camera Management to enable specific detection
          and monitoring capabilities.
        </Typography>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {renderContent()}

      {/* Camera Selection Drawer */}
      <CameraSelectionDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        useCase={selectedUseCase}
        cameras={cameras}
        onSave={handleSaveCameraAssignments}
        isLoading={isLoadingCameras ?? isAssigning}
      />
    </Container>
  );
};

export default UseCaseManager;
