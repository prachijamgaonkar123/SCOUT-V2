"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  Checkbox,
  Button,
  Grid,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import { Security } from "@mui/icons-material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/app/store/store";

import { showToast } from "@/app/store/slices/toasterSlice";
import {
  useAssignFeatureToRoleMutation,
  useGetFeaturesByOrgIdQuery,
} from "./AddFeaturesApi";
import Loader from "@/app/components/atoms/Loader/Loader";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { USE_MOCK, mockFeatures, setMockAssignedFeatures } from "../../roleManagementMockData";


/* ---------------- Component ---------------- */

const AddFeatures: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();

  const orgAppRoleId =
    typeof params?.orgAppRoleId === "string" ? params.orgAppRoleId : undefined;

  const tenantId = useSelector((state: RootState) => state.auth.user?.org_id);
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const { data: featuresApi = [], isLoading: isLoadingApi } = useGetFeaturesByOrgIdQuery(
    { userId: userId!, orgId: tenantId! },
    { skip: USE_MOCK || !userId || !tenantId }
  );
  const features = USE_MOCK ? mockFeatures : featuresApi;
  const isLoading = USE_MOCK ? false : isLoadingApi;

  const [assignFeatureToRole, { isLoading: isAssigning }] =
    useAssignFeatureToRoleMutation();

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  

  /* ---------------- Handlers ---------------- */

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeatureIds.length === features.length) {
      setSelectedFeatureIds([]);
    } else {
      setSelectedFeatureIds(features.map((f) => f.feature_id));
    }
  };

  const handleAssignFeatures = async () => {
    if (!orgAppRoleId || selectedFeatureIds.length === 0) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Missing required data",
          severity: "error",
        })
      );
      return;
    }

    if (USE_MOCK) {
      setMockAssignedFeatures(orgAppRoleId, selectedFeatureIds);
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Mock features assigned.",
          severity: "success",
        })
      );
      router.push("/roleOverview");
      return;
    }

    if (!tenantId) return;

    try {
      await assignFeatureToRole({
        tenantId,
        orgAppRoleId,
        featureIds: selectedFeatureIds,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Features assigned successfully",
          severity: "success",
        })
      );

      router.push("/roleOverview");
} catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
      message: getErrorMessage(err),
          severity: "error",
        })
      );
    }
  };
  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }}>
       { 
       isLoading ? ( 
        <Loader />
      ) : ( 
      <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                background: "#3072b0",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                mr: 2,
              }}
            >
              <Security sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select permissions to assign
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${selectedFeatureIds.length} / ${features.length} Selected`}
            sx={{
              background: "#3072b0",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Select All */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button variant="outlined" size="small" onClick={handleSelectAll}>
            {selectedFeatureIds.length === features.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </Box>

        {/* Feature Grid */}
        <FormGroup>
          <Grid container spacing={2}>
            {Array.isArray(features) &&
              features.map((feature) => {
              const checked = selectedFeatureIds.includes(feature.feature_id);

                return (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={feature.feature_id}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor: checked ? "#3072b0" : "#e2e8f0",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": {
                          borderColor: "#3072b0",
                          boxShadow: "0 4px 12px rgba(48,114,176,0.15)",
                        },
                      }}
                      onClick={() => toggleFeature(feature.feature_id)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Left side: Checkbox + Name */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Checkbox
                            checked={checked}
                            onChange={() => toggleFeature(feature.feature_id)}
                            sx={{
                              "&.Mui-checked": { color: "#3072b0" },
                            }}
                          />
                          <Typography fontWeight={checked ? 600 : 500}>
                            {feature.name}
                          </Typography>
                        </Box>

                        {/* Right side: Tick */}
                        {checked && (
                          <TaskAltIcon
                            sx={{
                              color: "#3072b0",
                              fontSize: 22,
                            }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
          </Grid>
        </FormGroup>

        {/* Save */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAssignFeatures}
            disabled={isAssigning}
            sx={{ px: 8, py: 1.5 }}
          >
            {isAssigning ? "Saving..." : "Save Permissions"}
          </Button>
        </Box>
      </Paper>
       )} 
    </Box>
  );
};

export default AddFeatures;
