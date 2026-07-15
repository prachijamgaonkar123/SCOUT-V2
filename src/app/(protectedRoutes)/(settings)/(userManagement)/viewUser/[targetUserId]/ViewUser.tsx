"use client";

import { Avatar, Box, Typography, Grid, Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

import EventIcon from "@mui/icons-material/Event";
import UpdateIcon from "@mui/icons-material/Update";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "@/utils/dateUtils";
import Loader from "@/app/components/atoms/Loader/Loader";
import {
  useGetUserDetailsByUserIdQuery,
  useGetUserRoleQuery,
} from "./ViewUserApi";
import { RootState } from "@/app/store/store";
import { showToast } from "@/app/store/slices/toasterSlice";
import { BackendUser } from "./viewUser.types";
import CardForSettings from "@/app/components/molecules/CardForSettings/CardForSettings";
import { USE_MOCK, mockOrgAppRoles } from "../../../(roleManagement)/roleManagementMockData";
import {
  mockBackendUsers,
  mockUserDetailsById,
  mockOrgAppRoleIdByUserId,
} from "../../userManagementMockData";

export default function ViewUserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  const tenantId = authUser?.org_id;
  const userId = authUser?.userId;
  const targetUserId =
    typeof params?.targetUserId === "string" ? params.targetUserId : "";

  // Fetch user roles
  const {
    data: roleListDataApi,
    isLoading: roleListLoadingApi,
    isError: roleListError,
  } = useGetUserRoleQuery(
    { tenantId: tenantId!, userId: targetUserId },
    { skip: USE_MOCK || !tenantId || !targetUserId },
  );

  // Fetch user details
  const {
    data: userDataApi,
    isLoading: userLoadingApi,
    isError: userError,
  } = useGetUserDetailsByUserIdQuery(
    { tenantId: tenantId!, userId: targetUserId },
    { skip: USE_MOCK || !tenantId || !userId },
  );

  const mockUser = mockBackendUsers.find((u) => u.userId === targetUserId);
  const mockDetails = mockUserDetailsById[targetUserId];
  const mockRole = mockOrgAppRoles.find(
    (r) => r.org_app_role_id === mockOrgAppRoleIdByUserId[targetUserId],
  );

  const roleListData = USE_MOCK
    ? {
        statusCode: 200,
        status: "success",
        message: "Mock data",
        data: {
          status: "success",
          message: "Mock data",
          data: mockRole ? [{ orgAppRole: { role_id: { name: mockRole.role_id.name } } }] : [],
        },
      }
    : roleListDataApi;
  const roleListLoading = USE_MOCK ? false : roleListLoadingApi;

  const userData = USE_MOCK
    ? {
        statusCode: 200,
        status: "success",
        message: "Mock data",
        data: {
          userId: mockUser?.userId ?? targetUserId,
          first_name: mockUser?.first_name ?? "",
          last_name: mockUser?.last_name ?? "",
          email: mockUser?.email ?? "",
          phoneNumber: mockUser?.phoneNumber ?? "",
          createdAt: mockUser?.createdAt ?? "",
          updatedAt: mockUser?.updatedAt ?? "",
          image_path: mockDetails?.image_path,
        },
      }
    : userDataApi;
  const userLoading = USE_MOCK ? false : userLoadingApi;
  // Handle errors
  useEffect(() => {
    if (roleListError) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Failed to fetch roles.",
          severity: "error",
        }),
      );
    }
    if (userError) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Failed to fetch user information.",
          severity: "error",
        }),
      );
    }
  }, [roleListError, userError, dispatch]);

  // ✅ ALWAYS define hooks first
  const user: BackendUser | null = userData?.data ?? null;

  const selectedRole = useMemo(() => {
    const roles = roleListData?.data?.data ?? [];
    return roles.length
      ? roles.map((r) => r.orgAppRole.role_id.name).join(", ")
      : "-";
  }, [roleListData]);

  const viewUser = useMemo(() => {
    return {
      name: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "-",
      email: user?.email ?? "-",
      phone: user?.phoneNumber ?? "-",
      status: "Active",
      createdAt: formatDate(user?.createdAt) ?? "-",
      updatedAt: formatDate(user?.updatedAt) ?? "-",
      role: selectedRole,
    };
  }, [user, selectedRole]);

  // ✅ ONLY ONE loader return, AFTER hooks
  if (roleListLoading || userLoading) {
    return <Loader />;
  }

  const handleEdit = () => router.push(`/editUser/${targetUserId}`);
  const handleBack = () => router.push("/userOverview");

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Box className="viewOrganisation">
        {/* Header */}
        <Box
          sx={{
            borderColor: "divider",
            pb: 2,
            px: 2,
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              alt={viewUser.name}
              src={user?.image_path || undefined}
              sx={{ width: 56, height: 56, borderRadius: "8px" }}
              variant="square"
              slotProps={{
                img: {
                  referrerPolicy: "no-referrer",
                },
              }}
            >
              {!user?.image_path && <PersonIcon />}
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={600}>
                {viewUser.name}
              </Typography>
              {/* <Typography
                variant="body1"
                sx={{
                  color: viewUser.status === "Active" ? "green" : "red",
                  fontWeight: 500,
                }}
              >
                {viewUser.status}
              </Typography> */}
            </Box>
          </Box>
          <Button variant="contained" onClick={handleEdit}>
            Edit User
          </Button>
        </Box>

        {/* User Info */}
        <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            <Typography variant="h6">User Information</Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Name"
                  text={viewUser.name}
                  icon={<PersonIcon />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Email"
                  text={viewUser.email}
                  icon={<EmailIcon />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Phone"
                  text={viewUser.phone}
                  icon={<PhoneIcon />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Role"
                  text={viewUser.role.toLowerCase().replaceAll(/[-_]/g, " ")}
                  icon={<ManageAccountsIcon />}
                />
              </Grid>
              {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Status"
                  text={viewUser.status}
                  icon={
                    viewUser.status === "Active" ? (
                      <CheckCircleIcon />
                    ) : (
                      <CancelIcon />
                    )
                  }
                />
              </Grid> */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Created At"
                  text={viewUser.createdAt}
                  icon={<EventIcon />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CardForSettings
                  title="Updated At"
                  text={viewUser.updatedAt}
                  icon={<UpdateIcon />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "left", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
