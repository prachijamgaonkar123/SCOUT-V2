"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  CloudUpload,
  Person,
  Lock,
  AssignmentInd,
  CameraAlt,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Avatar,
  Paper,
  Grid,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { showToast } from "@/app/store/slices/toasterSlice";
import styles from "./EditUser.module.css";

import {
  useEditUserMutation,
  useGetUserByIdQuery,
  useGetUserRoleByUserIdQuery,
} from "./EditUserApi";
import { useRoleListQuery } from "../../../(roleManagement)/roleOverview/RoleOverviewApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Loader from "@/app/components/atoms/Loader/Loader";
import {
  USE_MOCK,
  mockOrgAppRoles,
  mockEnvelope,
} from "../../../(roleManagement)/roleManagementMockData";
import {
  mockBackendUsers,
  mockUserDetailsById,
  mockOrgAppRoleIdByUserId,
  updateMockBackendUser,
} from "../../userManagementMockData";

interface UserFormValues {
  orgAppRoleId: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  phone: string;
  userName: string;
  password: string;
}

const EditUser: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const targetUserId = params?.targetUserId as string;

  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.org_id;
  const loggedInUserId = user?.userId;

  const [editUser, { isLoading: isSubmitting }] = useEditUserMutation();

  const { data: userDataApi, isLoading: isUserLoadingApi } = useGetUserByIdQuery(
    { tenantId: tenantId!, userId: targetUserId },
    { skip: USE_MOCK || !tenantId || !loggedInUserId || !targetUserId },
  );

  const { data: userRoleDataApi, isLoading: isUserRoleLoadingApi } =
    useGetUserRoleByUserIdQuery(
      { userId: targetUserId, orgId: tenantId! },
      { skip: USE_MOCK || !tenantId || !targetUserId },
    );

  const { data: roleDataApi, isLoading: isRoleLoadingApi } = useRoleListQuery(
    { tenantId: tenantId!, userId: loggedInUserId! },
    { skip: USE_MOCK || !tenantId || !loggedInUserId },
  );

  const mockUser = mockBackendUsers.find((u) => u.userId === targetUserId);
  const mockDetails = mockUserDetailsById[targetUserId];
  const mockOrgAppRoleId = mockOrgAppRoleIdByUserId[targetUserId];
  const mockRole = mockOrgAppRoles.find((r) => r.org_app_role_id === mockOrgAppRoleId);

  const userData = USE_MOCK
    ? {
        status: "success",
        message: "Mock data",
        data: {
          first_name: mockUser?.first_name ?? "",
          last_name: mockUser?.last_name ?? "",
          email: mockUser?.email ?? "",
          employee_id: mockDetails?.employee_id ?? "",
          phoneNumber: mockUser?.phoneNumber ?? "",
          userName: mockDetails?.userName ?? "",
          image_path: mockDetails?.image_path,
        },
      }
    : userDataApi;
  const isUserLoading = USE_MOCK ? false : isUserLoadingApi;

  const userRoleData = USE_MOCK
    ? {
        status: "success",
        message: "Mock data",
        data: {
          status: "success",
          message: "Mock data",
          data: mockRole ? [{ orgAppRole: mockRole }] : [],
        },
      }
    : userRoleDataApi;
  const isUserRoleLoading = USE_MOCK ? false : isUserRoleLoadingApi;

  const roleData = USE_MOCK ? mockEnvelope(mockOrgAppRoles) : roleDataApi;
  const isRoleLoading = USE_MOCK ? false : isRoleLoadingApi;

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { control, handleSubmit, setValue, watch } = useForm<UserFormValues>({
    shouldUnregister: false,
    defaultValues: {
      orgAppRoleId: "",
      firstName: "",
      lastName: "",
      email: "",
      employeeId: "",
      phone: "",
      userName: "",
      password: "",
    },
  });

  /** ✅ USER ROLE (SOURCE OF TRUTH) */
  const userRole = userRoleData?.data?.data?.[0];
  const userOrgAppRoleId = userRole?.orgAppRole?.org_app_role_id;
  const userRoleName = userRole?.orgAppRole?.role_id?.name;

  /** ✅ PREFILL USER DATA */
  useEffect(() => {
    if (!userData?.data) return;

    const u = userData.data;
    setValue("firstName", u.first_name ?? "");
    setValue("lastName", u.last_name ?? "");
    setValue("email", u.email ?? "");
    setValue("employeeId", u.employee_id ?? "");
    setValue("phone", u.phoneNumber ?? "");
    setValue("userName", u.userName ?? "");
    setImagePreview(u.image_path ?? null);
  }, [userData, setValue]);

  /** ✅ PREFILL ROLE (NO MATCHING) */
  useEffect(() => {
    if (userOrgAppRoleId) {
      setValue("orgAppRoleId", userOrgAppRoleId);
    }
  }, [userOrgAppRoleId, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfileImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    if (USE_MOCK) {
      updateMockBackendUser(targetUserId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        employeeId: data.employeeId,
        phone: data.phone,
        userName: data.userName,
        orgAppRoleId: data.orgAppRoleId,
      });

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Mock user updated successfully",
          severity: "success",
        }),
      );

      router.push("/userOverview");
      return;
    }

    try {
      await editUser({
        payload: {
          orgAppRoleId: data.orgAppRoleId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          employeeId: data.employeeId,
          phone: data.phone,
          userName: data.userName,
          orgId: tenantId!,
          targetUserId,
        },
        image: profileImage ?? undefined,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "User updated successfully",
          severity: "success",
        }),
      );

      router.push("/userOverview");
    } catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(err, "Failed to update user"),
          severity: "error",
        }),
      );
    }
  };
  const isPageLoading = isUserLoading || isUserRoleLoading || isRoleLoading;

  return (
    <>
      {isPageLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Loader />
        </Box>
      ) : (
        <Paper sx={{ p: 2, m: 1.5 }}>
          <Box className={styles.formWrapper}>
            {/* ROLE */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <AssignmentInd color="primary" />
                <Typography variant="subtitle1">Role</Typography>
              </Box>
              <Controller
                name="orgAppRoleId"
                control={control}
                render={() => {
                  const selectedOrgAppRoleId =
                    watch("orgAppRoleId") || userOrgAppRoleId;

                  return (
                    <TextField
                      select
                      fullWidth
                      required
                      disabled
                      label="Role"
                      value={selectedOrgAppRoleId}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const selected = value as string;

                            if (selected === userOrgAppRoleId) {
                              return userRoleName;
                            }

                            const role = roleData?.data?.data?.find(
                              (r) => r.org_app_role_id === selected,
                            );

                            return role?.role_id?.name || "";
                          },
                        },
                      }}
                    >
                      {userOrgAppRoleId && (
                        <MenuItem
                          value={userOrgAppRoleId}
                          sx={{ display: "none" }}
                        >
                          {userRoleName}
                        </MenuItem>
                      )}

                      {roleData?.data?.data?.map((role) => (
                        <MenuItem
                          key={role.org_app_role_id}
                          value={role.org_app_role_id}
                        >
                          {role.role_id.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }}
              />
            </Box>

            {/* REST OF FORM — UNCHANGED */}
            {/* ... everything else stays exactly the same ... */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <Person color="primary" />
                <Typography variant="subtitle1">User Information</Typography>
              </Box>

              <Grid container spacing={3}>
                {[
                  ["firstName", "First Name"],
                  ["lastName", "Last Name"],
                  ["employeeId", "Employee ID"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                ].map(([name, label]) => (
                  <Grid key={name} size={{ xs: 12, md: 3 }}>
                    <Controller
                      name={name as keyof UserFormValues}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label={label} fullWidth />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* USERNAME */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <Lock color="primary" />
                <Typography variant="subtitle1">Credentials</Typography>
              </Box>

              <Controller
                name="userName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Username" fullWidth />
                )}
              />
            </Box>

            {/* IMAGE */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <CameraAlt color="primary" />
                <Typography variant="subtitle1">Profile Picture</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* <Avatar src={imagePreview ?? ""} sx={{ width: 100, height: 100 }} /> */}
                <Avatar
                  src={imagePreview ?? ""}
                  sx={{ width: 100, height: 100 }}
                  slotProps={{
                    img: {
                      referrerPolicy: "no-referrer",
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                >
                  Upload
                  {/* Wrap the input so JSX spacing is unambiguous */}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </Button>
              </Box>
            </Box>

            {/* ACTIONS */}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
            >
              <Button
                variant="outlined"
                onClick={() => router.push("/userOverview")}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default EditUser;
