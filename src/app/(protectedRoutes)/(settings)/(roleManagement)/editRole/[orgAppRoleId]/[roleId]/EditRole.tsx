"use client";
import React, { useEffect, useState } from "react";
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
  useGetFeaturesOfRoleByRoleIdQuery,
  useGetFeaturesByOrgIdQuery,
  useUnmappedFeatureFromRoleByRoleIdMutation,
} from "./EditRoleApi";
import Loader from "@/app/components/atoms/Loader/Loader";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { RoleFeature } from "./EditRole.types";
import {
  USE_MOCK,
  mockFeatures,
  getMockAssignedFeatures,
  mockEnvelope,
  setMockAssignedFeatures,
} from "../../../roleManagementMockData";

/* ---------------- Types ---------------- */

interface Feature {
  feature_id: string;
  name: string;
  description: string;
}

/* ---------------- Component ---------------- */

const EditRole: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();

  const orgAppRoleId =
    typeof params?.orgAppRoleId === "string" ? params.orgAppRoleId : undefined;
  const roleId = typeof params?.roleId === "string" ? params.roleId : undefined;

  const tenantId = useSelector((state: RootState) => state.auth.user?.org_id);
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  /* ---------------- API hooks ---------------- */
  const { data: allFeaturesResApi, isLoading: isAllLoadingApi } =
    useGetFeaturesByOrgIdQuery(
      { userId: userId!, orgId: tenantId! },
      { skip: USE_MOCK || !userId || !tenantId },
    );
  const allFeaturesRes = USE_MOCK ? mockEnvelope(mockFeatures) : allFeaturesResApi;
  const isAllLoading = USE_MOCK ? false : isAllLoadingApi;

// ✅ Narrow types first, then no assertions needed
const isReady = !!tenantId && !!roleId && !!orgAppRoleId;

const { data: roleFeaturesResApi, isLoading: isRoleLoadingApi } =
  useGetFeaturesOfRoleByRoleIdQuery(
    {
      tenantId: tenantId ?? "",
      roleId: roleId ?? "",
      orgAppRoleId: orgAppRoleId ?? "",
    },
    { skip: USE_MOCK || !isReady },
  );
  const roleFeaturesRes = USE_MOCK
    ? mockEnvelope(
        getMockAssignedFeatures(orgAppRoleId).map((f) => ({ feature_id: f.feature_id, feature: f }))
      )
    : roleFeaturesResApi;
  const isRoleLoading = USE_MOCK ? false : isRoleLoadingApi;

  const [assignFeatureToRole, { isLoading: isAssigning }] =
    useAssignFeatureToRoleMutation();

  const [unmapFeatureFromRole] = useUnmappedFeatureFromRoleByRoleIdMutation();

  /* ---------------- State ---------------- */
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [initialFeatureIds, setInitialFeatureIds] = useState<string[]>([]);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    if (allFeaturesRes?.data?.data) {
      setFeatures(allFeaturesRes.data.data);
    }
  }, [allFeaturesRes]);

  useEffect(() => {
    const assigned =
      roleFeaturesRes?.data?.data
        ?.map(
          (item: RoleFeature) => item.feature_id ?? item.feature?.feature_id,
        )
        .filter((id): id is string => Boolean(id)) ?? [];

    setSelectedFeatureIds(assigned);
    setInitialFeatureIds(assigned);
  }, [roleFeaturesRes]);
  /* ---------------- Loading ---------------- */
  const isPageLoading = isAllLoading || isRoleLoading;

  /* ---------------- Handlers ---------------- */
  const toggleFeature = (id: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedFeatureIds(
      selectedFeatureIds.length === features.length
        ? []
        : features.map((f) => f.feature_id),
    );
  };

  const handleSave = async () => {
    if (!orgAppRoleId) return;

    const toAssign = selectedFeatureIds.filter(
      (id) => !initialFeatureIds.includes(id),
    );

    const toUnmap = initialFeatureIds.filter(
      (id) => !selectedFeatureIds.includes(id),
    );

    // ✅ NOTHING CHANGED → DO NOTHING
    if (toAssign.length === 0 && toUnmap.length === 0) {
      return;
    }

    if (USE_MOCK) {
      setMockAssignedFeatures(orgAppRoleId, selectedFeatureIds);
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Mock permissions updated.",
          severity: "success",
        }),
      );
      router.push("/roleOverview");
      return;
    }

    if (!tenantId) return;

    try {
      if (toUnmap.length > 0) {
        await unmapFeatureFromRole({
          tenantId,
          orgAppRoleId,
          featureIds: toUnmap,
        }).unwrap();
      }

      if (toAssign.length > 0) {
        await assignFeatureToRole({
          tenantId,
          orgAppRoleId,
          featureIds: toAssign,
        }).unwrap();
      }

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Permissions updated successfully",
          severity: "success",
        }),
      );

      router.push("/roleOverview");
    } catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(err),
          severity: "error",
        }),
      );
    }
  };

  const hasChanges =
    initialFeatureIds.toSorted((a, b) => a.localeCompare(b)).join(",") !==
    selectedFeatureIds.toSorted((a, b) => a.localeCompare(b)).join(",");
  return (
    <Box sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }}>
      {isPageLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <Loader />
        </Box>
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
                  const checked = selectedFeatureIds.includes(
                    feature.feature_id,
                  );

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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
            }}
          >
            {/* Back Button */}
            <Button variant="outlined" onClick={() => router.back()}>
              Back
            </Button>

            {/* Save Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={!hasChanges || isAssigning}
            >
              {isAssigning ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EditRole;
