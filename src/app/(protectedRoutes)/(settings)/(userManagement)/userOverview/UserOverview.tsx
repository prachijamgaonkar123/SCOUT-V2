
"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/app/store/store";
import {
  useDeleteUserMutation,
  useGetUserOverviewQuery,
} from "./UserOverviewApi";
import type { BackendUser } from "./UserOverviewApi";
import Loader from "@/app/components/atoms/Loader/Loader";
import { showToast } from "@/app/store/slices/toasterSlice";
import { FEATURE } from "@/app/config/featureRegistry";
import UserSettingTable from "@/app/components/organisms/UserSettingTable/UserSettingTable";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  USE_MOCK,
  mockBackendUsers,
  removeMockBackendUser,
} from "../userManagementMockData";

const UserOverview: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, features } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.org_id;
  const userId = user?.userId;
  

  /* ---------- PERMISSIONS ---------- */
  const canAddUser = features.includes(FEATURE.ADD_USER);
  const canViewUser = features.includes(FEATURE.VIEW_USER) ;
  const canEditUser = features.includes(FEATURE.EDIT_USER)  ;
  const canDeleteUser = features.includes(FEATURE.DELETE_USER);

  const { data, isLoading: isLoadingApi, isError, error } = useGetUserOverviewQuery(
    { tenantId: tenantId!, userId: userId! },
    { skip: USE_MOCK || !tenantId || !userId }
  );
  const isLoading = USE_MOCK ? false : isLoadingApi;

  const [mockUsersState, setMockUsersState] = useState<BackendUser[]>(mockBackendUsers);

  const [deleteUser, { isLoading: isDeletingApi }] = useDeleteUserMutation();
  const isDeleting = USE_MOCK ? false : isDeletingApi;

  /** ----- SEARCH STATE ----- */
  const [searchQuery, setSearchQuery] = useState("");

  /** ----- FILTERED USERS ----- */
  const loggedInUserRole =
  data?.data?.data?.find((u) => u.userId === userId)?.roleName ?? null;

  const { filteredBackendUsers, filteredTableUsers } = useMemo(() => {
  const backendUsers: BackendUser[] = USE_MOCK ? mockUsersState : (data?.data?.data ?? []);

  // 🔥 Hide Organisation_Admin_Scout users if logged-in user is not Organisation_Admin_Scout
  const roleFilteredUsers = backendUsers.filter((u) => {
    if (
      u.roleName === "Organisation_Admin_Scout" &&
      loggedInUserRole !== "Organisation_Admin_Scout"
    ) {
      return false;
    }
    return true;
  });

  if (!searchQuery.trim()) {
    return {
      filteredBackendUsers: roleFilteredUsers,
      filteredTableUsers: roleFilteredUsers.map((u) => ({
        firstName: u.first_name ?? "",
        lastName: u.last_name ?? "",
        email: u.email,
        phone: u.phoneNumber ?? "",
        roleName:u.roleName??""
      })),
    };
  }

  const query = searchQuery.toLowerCase();

  const searchedUsers = roleFilteredUsers.filter((u) => {
    return (
      (u.first_name ?? "").toLowerCase().includes(query) ||
      (u.last_name ?? "").toLowerCase().includes(query) ||
      (u.email ?? "").toLowerCase().includes(query) ||
      (u.phoneNumber ?? "").toLowerCase().includes(query)||
            (u.roleName ?? "").toLowerCase().includes(query)

    );
  });

  return {
    filteredBackendUsers: searchedUsers,
    filteredTableUsers: searchedUsers.map((u) => ({
      firstName: u.first_name ?? "",
      lastName: u.last_name ?? "",
      email: u.email,
      phone: u.phoneNumber ?? "",
              roleName:u.roleName??""

    })),
  };
}, [data?.data?.data, searchQuery, loggedInUserRole, mockUsersState]);
  /** ----- DIALOG STATE ----- */
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  const handleView = (index: number) => {
    const selectedUser = filteredBackendUsers[index];
    if (!selectedUser) return;
    router.push(`/viewUser/${selectedUser.userId}`);
  };

  const handleEdit = (index: number) => {
    const selectedUser = filteredBackendUsers[index];
    if (!selectedUser) return;
    router.push(`/editUser/${selectedUser.userId}`);
  };

  const handleOpenConfirm = (index: number) => {
    setSelectedUserIndex(index);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setSelectedUserIndex(null);
    setOpenConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUserIndex === null) return;
    const selectedUser = filteredBackendUsers[selectedUserIndex];

    if (USE_MOCK) {
      removeMockBackendUser(selectedUser.userId);
      setMockUsersState([...mockBackendUsers]);
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: `User "${selectedUser.first_name} ${selectedUser.last_name}" deleted successfully`,
          severity: "success",
        })
      );
      handleCloseConfirm();
      return;
    }

    try {
      await deleteUser({
        tenantId: tenantId!,
        userId: userId!,
        targetUserId: selectedUser.userId,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: `User "${selectedUser.first_name} ${selectedUser.last_name}" deleted successfully`,
          severity: "success",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(err, "Failed to delete user"),
          severity: "error",
        })
      );
    } finally {
      handleCloseConfirm();
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {isError && (
        <Typography color="error">
          {getErrorMessage(error, "Failed to fetch users")}
        </Typography>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {canAddUser && (
          <Button
            variant="contained"
            onClick={() => router.push("/addUser")}
          >
            Add User
          </Button>
        )}
      </Box>

      {filteredTableUsers.length > 0 && !isLoading && (
        <UserSettingTable
          users={filteredTableUsers}
          backendUsers={filteredBackendUsers}
          currentUserId={userId}
          canView={canViewUser}
          canEdit={canEditUser}
          canDelete={canDeleteUser}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleOpenConfirm}
        />
      )}

      {filteredTableUsers.length === 0 && !isError && (
        <Typography color="text.secondary">
          {searchQuery ? "No users found matching your search." : "No users found."}
        </Typography>
      )}

      {/* ---------- CONFIRM DELETE DIALOG ---------- */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserOverview;