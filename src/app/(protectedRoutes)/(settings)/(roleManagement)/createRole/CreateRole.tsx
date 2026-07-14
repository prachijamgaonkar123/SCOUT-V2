

"use client";
import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { Badge } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store/store";
import { useCreateRoleMutation } from "./CreateRoleApi";
import { showToast } from "@/app/store/slices/toasterSlice";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { USE_MOCK, addMockRole } from "../roleManagementMockData";

const CreateRole: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  // Pull tenantId and userId from auth slice
  const tenantId = useSelector((state: RootState) => state.auth.user?.org_id);
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const [createRole, { isLoading }] = useCreateRoleMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName || (!USE_MOCK && (!tenantId || !userId))) {
      dispatch(
        showToast({
          message: "Missing role name or user info",
          severity: "error",
          id: crypto.randomUUID(),
        })
      );
      return;
    }

    if (USE_MOCK) {
      const newRole = addMockRole(roleName);
      dispatch(
        showToast({
          message: "Mock role created.",
          severity: "success",
          id: crypto.randomUUID(),
        })
      );
      router.push(`/addFeatures/${newRole.org_app_role_id}`);
      return;
    }

    if (!tenantId || !userId) return;

    try {
      const response = await createRole({
        tenantId,
        userId,
        roleName,
        description: roleDescription,
      }).unwrap();

      const orgAppRoleId = response.data.data.org_app_role_id;

      dispatch(
        showToast({
          message: response.message,
          severity: "success",
          id: crypto.randomUUID(),
        })
      );

      // ✅ pass real ID
      router.push(`/addFeatures/${orgAppRoleId}`);
    } catch (err) {
      dispatch(
        showToast({
          message: getErrorMessage(err),
          severity: "error",
          id: crypto.randomUUID(),
        })
      );
    }
  };

  return (
    <Box>
      <Box sx={{ mx: "auto", mt: 4, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={3}>
              {/* Header */}
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
                  <Badge sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "#2d3748" }}
                >
                  Role Details
                </Typography>
              </Box>

              {/* Role Name */}
              <TextField
                label="Role Name"
                placeholder="e.g. Admin, Manager"
                fullWidth
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />

              {/* Role Description */}
              <TextField
                label="Role Description"
                placeholder="Describe the role's purpose"
                fullWidth
                required
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />

              {/* Buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  onClick={() => router.back()}
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "#3072b0",
                    borderRadius: 2,
                    "&:hover": { background: "#265d8f" },
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "#3072b0",
                    borderRadius: 2,
                    "&:hover": { background: "#265d8f" },
                  }}
                >
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </form>
      </Box>
    </Box>
  );
};

export default CreateRole;
