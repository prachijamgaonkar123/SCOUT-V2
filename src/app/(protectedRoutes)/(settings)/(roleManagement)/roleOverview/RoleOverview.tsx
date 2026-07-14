
'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store/store';
import { useRoleListQuery, useDeleteRoleByIdMutation } from './RoleOverviewApi';
import { FEATURE } from '@/app/config/featureRegistry';
import Loader from "@/app/components/atoms/Loader/Loader";
import { showToast } from '@/app/store/slices/toasterSlice';
import AddRole from '../addRole/AddRole';
import RoleSettingTable from '@/app/components/organisms/RoleSettingTable/RoleSettingTable';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { USE_MOCK, mockOrgAppRoles, removeMockRole } from '../roleManagementMockData';

export default function RoleOverview() {
  const router = useRouter();
  const dispatch = useDispatch();

  /* ---------- AUTH ---------- */
  const { user, features } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.org_id;
  const userId = user?.userId;
  const roleName = user?.role;

  /* ---------- PERMISSIONS ---------- */
  const canAddRole = features.includes(FEATURE.CREATE_ROLE);
  const canViewRole = features.includes(FEATURE.VIEW_ROLE);
  const canEditRole = features.includes(FEATURE.EDIT_ROLE);
  const canDeleteRole = features.includes(FEATURE.DELETE_ROLE);

  /* ---------- API ---------- */
  const { data, isLoading: isLoadingApi, isFetching: isFetchingApi } = useRoleListQuery(
    { tenantId: tenantId!, userId: userId! },
    { skip: USE_MOCK || !tenantId || !userId }
  );
  const isLoading = USE_MOCK ? false : isLoadingApi;
  const isFetching = USE_MOCK ? false : isFetchingApi;

  const [mockRoles, setMockRoles] = useState(mockOrgAppRoles);

  const rows = useMemo(() => {
    if (USE_MOCK) return mockRoles;
    return data?.data?.data ?? [];
  }, [data, mockRoles]);

  const [deleteRoleById, { isLoading: isDeleting }] =
    useDeleteRoleByIdMutation();

  /* ---------- STATE ---------- */
  const [orderBy] = useState<"name" | "role_id" | "createdAt" | "updatedAt">(
    "name"
  );
  const [order] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page] = useState(0);
  const [rowsPerPage] = useState(10);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  /* ---------- SORT ---------- */
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (orderBy) {
        case "name":
          aVal = a.role_id?.name ?? "";
          bVal = b.role_id?.name ?? "";
          break;
        case "role_id":
          aVal = a.role_id?.role_id ?? "";
          bVal = b.role_id?.role_id ?? "";
          break;
        case "createdAt":
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case "updatedAt":
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
      }

      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [rows, order, orderBy]);

  /* ---------- SEARCH ---------- */
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sortedRows.filter(
      (r) =>
        r.role_id?.name?.toLowerCase().includes(q) ||
        r.role_id?.role_id?.toLowerCase().includes(q)
    );
  }, [sortedRows, searchQuery]);

  /* ---------- PAGINATION ---------- */
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* ---------- HANDLERS ---------- */
  const handleView = (orgAppRoleId: string, roleId: string) =>
    router.push(`/viewRole/${orgAppRoleId}/${roleId}`);

  const handleEdit = (orgAppRoleId: string, roleId: string) =>
    router.push(`/editRole/${orgAppRoleId}/${roleId}`);

  const handleOpenConfirm = (roleId: string) => {
    setSelectedRoleId(roleId);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedRoleId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoleId) return;

    if (USE_MOCK) {
      removeMockRole(selectedRoleId);
      setMockRoles([...mockOrgAppRoles]);
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: 'Mock role deleted.',
          severity: 'success',
        })
      );
      handleCloseConfirm();
      return;
    }

    if (!tenantId || !userId) return;

    try {
      const res = await deleteRoleById({
        tenantId,
        userId,
        roleId: selectedRoleId,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: res.message || "Role deleted successfully",
          severity: "success",
        })
      );

      handleCloseConfirm();
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

 


  /* ---------- EMPTY STATE ---------- */
if (!isLoading && !isFetching && rows.length === 0) {
    return <AddRole />;
  }

  /* ---------- UI ---------- */
  return (
<Box sx={{ p: 2 }}>
  {isFetching || isLoading ? (
    // ✅ Loader while fetching
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Loader />
    </Box>
  ) : (
    // ✅ Content after loading
    <>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {canAddRole && (
          <Button
            variant="contained"
            onClick={() => router.push("/createRole")}
          >
            Add Role
          </Button>
        )}
      </Box>

      <RoleSettingTable
        rows={paginatedRows}
        roleName={roleName}
        canView={canViewRole}
        canEdit={canEditRole}
        canDelete={canDeleteRole}
        isDeleting={isDeleting}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleOpenConfirm}
      />

      {/* ---------- CONFIRM DIALOG ---------- */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this role? This action cannot be
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
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )}
</Box>

)}
