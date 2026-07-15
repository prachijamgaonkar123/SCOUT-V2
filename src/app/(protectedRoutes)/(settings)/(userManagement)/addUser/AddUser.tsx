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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Avatar,
  Paper,
  Grid,
} from "@mui/material";
import styles from "./AddUser.module.css";
import { useRouter } from "next/navigation";
import { RootState } from "@/app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useAddUserMutation } from "./AddUserApi";
import { showToast } from "@/app/store/slices/toasterSlice";
import Loader from "@/app/components/atoms/Loader/Loader";
import { useRoleListQuery } from "../../(roleManagement)/roleOverview/RoleOverviewApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { skipToken } from "@reduxjs/toolkit/query";
import { OrgAppRole } from "./AddUser.types";
import { USE_MOCK, mockOrgAppRoles, mockEnvelope } from "../../(roleManagement)/roleManagementMockData";
import { addMockBackendUser } from "../userManagementMockData";

interface UserFormValues {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  phone: string;
  userName: string;
  password: string;
}

const generatePassword = (length = 12): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@$!%*?&";
  const all = upper + lower + numbers + special;

  const cryptoRandom = (set: string) =>
    set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];

  const passwordArray = [
    cryptoRandom(upper),
    cryptoRandom(numbers),
    cryptoRandom(special),
  ];

  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(cryptoRandom(all));
  }

  return passwordArray
    .toSorted(() => crypto.getRandomValues(new Uint32Array(1))[0] - 0.5)
    .join("");
};
const AddUser: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.org_id;
  const userId = user?.userId;

  const [addUser, { isLoading: isSubmitting }] = useAddUserMutation();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: dataApi, isLoading: isLoadingApi } = useRoleListQuery(
    USE_MOCK || !tenantId || !userId ? skipToken : { tenantId, userId },
  );
  const data = USE_MOCK ? mockEnvelope(mockOrgAppRoles) : dataApi;
  const isLoading = USE_MOCK ? false : isLoadingApi;

  const { control, handleSubmit, reset, setValue } = useForm<UserFormValues>({
    defaultValues: {
      role: "",
      firstName: "",
      lastName: "",
      email: "",
      employeeId: "",
      phone: "",
      userName: "",
      password: "",
    },
  });

  useEffect(() => {
    setValue("password", generatePassword());
  }, [setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    setProfileImage(file);

    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<UserFormValues> = async (formData) => {
    if (USE_MOCK) {
      addMockBackendUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employeeId: formData.employeeId,
        phone: formData.phone,
        userName: formData.userName,
        orgAppRoleId: formData.role,
      });

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "Mock user added successfully",
          severity: "success",
        }),
      );

      reset();
      setProfileImage(null);
      setImagePreview(null);
      router.push("/userOverview");
      return;
    }

    try {
      await addUser({
        payload: {
          ...formData,
          orgAppRoleId: formData.role,
          orgId: tenantId!,
        },
        image: profileImage ?? undefined,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: "User added successfully",
          severity: "success",
        }),
      );

      reset();
      setProfileImage(null);
      setImagePreview(null);
      router.push("/userOverview");
    } catch (error) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(error, "Failed to add user"),
          severity: "error",
        }),
      );
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <Paper sx={{ p: 2, m: 1.5 }}>
      <Box className={styles.formWrapper}>
        {/* ROLE */}
        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <AssignmentInd color="primary" />
            <Typography variant="subtitle1">Select Role</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select {...field} label="Role" disabled={isLoading}>
                      {data?.data?.data?.map((r: OrgAppRole) => (
                        <MenuItem
                          key={r.org_app_role_id}
                          value={r.org_app_role_id}
                        >
                          {r.role_id.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* USER INFO – 5 FIELD GRID */}
        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Person color="primary" />
            <Typography variant="subtitle1">User Information</Typography>
          </Box>

          <Grid container spacing={4}>
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
                  rules={{ required: `${label} is required` }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={label}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CREDENTIALS */}
        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Lock color="primary" />
            <Typography variant="subtitle1">Credentials</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="userName"
                control={control}
                rules={{ required: "Username is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password (Auto-generated)"
                    fullWidth
                    disabled
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <CameraAlt color="primary" />
            <Typography variant="subtitle1">Profile Picture</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={imagePreview ?? ""} sx={{ width: 100, height: 100 }} />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
            >
              <span>Upload</span>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>
        </Box>
        {/* ACTIONS */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
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
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddUser;
