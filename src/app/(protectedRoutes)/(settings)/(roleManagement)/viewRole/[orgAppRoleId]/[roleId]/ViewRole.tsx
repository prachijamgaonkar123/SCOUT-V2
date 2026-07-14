"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Typography, Grid, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import CardForSettings from "@/app/components/molecules/CardForSettings/CardForSettings";
import {
  useGetFeatureOfRoleByRoleIdMutation,
  useGetRoleQuery,
} from "./ViewRoleApi";
import { RootState } from "@/app/store/store";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { formatDate } from "@/utils/dateUtils";
import { OrgAppRole, RoleFeature } from "./ViewRole.types";
import Loader from "@/app/components/atoms/Loader/Loader";
import { USE_MOCK, mockOrgAppRoles, getMockAssignedFeatures } from "../../../roleManagementMockData";

export default function ViewRolePage() {
  const router = useRouter();
  const params = useParams();

  const tenantId = useSelector((state: RootState) => state.auth.user?.org_id);

  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const roleId = typeof params?.roleId === "string" ? params.roleId : undefined;

  const orgAppRoleId =
    typeof params?.orgAppRoleId === "string" ? params.orgAppRoleId : undefined;

  /* ---------------- ROLE OVERVIEW API ---------------- */
  const { data, isLoading: isLoadingForRoleApi } = useGetRoleQuery(
    USE_MOCK ? skipToken : tenantId && userId ? { tenantId, userId } : skipToken,
  );
  const isLoadingForRole = USE_MOCK ? false : isLoadingForRoleApi;

  const selectedRole = useMemo<OrgAppRole | undefined>(() => {
    if (USE_MOCK) {
      return mockOrgAppRoles.find((item) => item.org_app_role_id === orgAppRoleId);
    }
    const roleList = data?.data?.data ?? [];
    return roleList.find((item) => item.org_app_role_id === orgAppRoleId);
  }, [data, orgAppRoleId]);

  /* ---------------- FEATURE API ---------------- */
  const [fetchFeatures, { isLoading: isLoadingFeaturesApi, isError }] =
    useGetFeatureOfRoleByRoleIdMutation();
  const isLoading = USE_MOCK ? false : isLoadingFeaturesApi;

  const [features, setFeatures] = useState<RoleFeature[]>([]);

  /* ---------------- FETCH FEATURES ---------------- */

  useEffect(() => {
    if (USE_MOCK) {
      setFeatures(
        getMockAssignedFeatures(orgAppRoleId).map((f) => ({
          role_feature_id: `mock-rf-${f.feature_id}`,
          feature: f,
        }))
      );
      return;
    }

    if (!tenantId || !roleId || !orgAppRoleId) return;

    fetchFeatures({ tenantId, roleId, orgAppRoleId })
      .unwrap()
      .then((res) => {
        setFeatures(res.data.data);
      });
  }, [tenantId, roleId, orgAppRoleId, fetchFeatures]);

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography color="error">Failed to fetch role details.</Typography>
      </Box>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <Box className="viewRole" sx={{ p: 2 }}>
      {/* ---------------- ROLE DETAILS ---------------- */}
      {isLoadingForRole || isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 20,
          }}
        >
          <Loader />
        </Box>
      ) : (
        <>
          <Typography variant="h6" mb={2}>
            Role Details :
          </Typography>

          <Grid container spacing={2} mb={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CardForSettings
                title="Role Name"
                text={selectedRole?.role_id?.name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CardForSettings
                title="Created At"
                text={formatDate(selectedRole?.createdAt)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CardForSettings
                title="Updated At"
                text={formatDate(selectedRole?.updatedAt)}
              />
            </Grid>
          </Grid>

          {/* ---------------- ASSIGNED FEATURES ---------------- */}
          <Typography variant="h6" mb={2}>
            Assigned Features :
          </Typography>

          <Grid container spacing={2}>
            {features.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.role_feature_id}>
                <CardForSettings
                  title={item.feature?.name}
                  icon={<CheckCircleOutlineIcon color="primary" />}
                  text={
                    <Typography variant="body2">
                      {item.feature?.description}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
          {/* ---------------- BACK BUTTON ---------------- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => router.push("/roleOverview")}
            >
              Back
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
