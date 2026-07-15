"use client";

import React, { useState, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import {
  ZoneTable,
  AddEditZoneDrawer,
  AssignLocationsDrawer,
} from "@/app/components/organisms/configurator/zone-location";


export type Location = {
  id: string;
  locationName: string;
  description?: string;
};

type ZoneType = {
  id: string;
  name: string;
  description?: string;  
  locations?: Location[];

  locationsCount?: number;      
  camerasCount?: number;        
};


import {
  useGetZonesQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  useCreateLocationMutation,
  GetZonesResponse,
  Zone as ApiZone,
  Location as ApiLocation,
} from "./ZoneLocationMappingApi";
import { mockZonesResponse } from "./zoneLocationMockData";
import { useDispatch } from "react-redux";
import { showToast } from "@/app/store/slices/toasterSlice";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";


type LocationItem = {
  id: string;
  name: string;
  description?: string;
};


type ZoneFormData = {
  id?: string;
  name: string;
  description?: string;
};

const ZoneLocationMapping: React.FC = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<ZoneType | null>(null);

  // Drawer states
  const [addEditDrawerOpen, setAddEditDrawerOpen] = useState(false);
  const [locationsDrawerOpen, setLocationsDrawerOpen] = useState(false);

  // RTK Query hooks
  const { data: zonesResponseApi, isLoading, error } = useGetZonesQuery(undefined, {
    skip: USE_MOCK,
  });
  const [mockZones, setMockZones] = useState<GetZonesResponse>(mockZonesResponse);
  const zonesResponse = USE_MOCK ? mockZones : zonesResponseApi;

  const [createZone, { isLoading: isCreating }] = useCreateZoneMutation();
  const [updateZone] = useUpdateZoneMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeleteZoneMutation();
  const [createLocation] = useCreateLocationMutation();

  // Process zones data
  const zones = useMemo(() => {
    if (!zonesResponse?.zones) return [];

    return zonesResponse.zones.map((z) => ({
  id: z.id,
  name: z.zoneName,
  description: z.description,

  locations: z.locations,          // ✅ RESTORE
  locationsCount: z.locationsCount,
  camerasCount: z.camerasCount,
}));

  }, [zonesResponse]);



  // Filter zones
  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (zone.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new zone
  const handleAddZone = () => {
    setSelectedZone(null);
    setAddEditDrawerOpen(true);
  };

  // Edit zone
  const handleEditZone = (zone: ZoneType) => {
    setSelectedZone(zone);
    setAddEditDrawerOpen(true);
  };

  // Delete zone
  const handleDeleteZone = (zone: ZoneType) => {
    setZoneToDelete(zone);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!zoneToDelete?.id) return;

    if (USE_MOCK) {
      setMockZones((prev) => ({
        ...prev,
        zones: prev.zones.filter((z) => z.id !== zoneToDelete.id),
      }));
      dispatch(showToast({ id: crypto.randomUUID(), message: "Mock zone deleted.", severity: "success" }));
      setZoneToDelete(null);
      return;
    }

    try {
      await deleteZone(zoneToDelete.id).unwrap();
      setZoneToDelete(null);
    } catch (err) {
      console.error("Failed to delete zone", err);
    }
  };

  // Save zone (add or edit)
  const handleSaveZone = async (zoneData: ZoneFormData) => {
    if (USE_MOCK) {
      setMockZones((prev) => {
        if (zoneData.id) {
          return {
            ...prev,
            zones: prev.zones.map((z) =>
              z.id === zoneData.id
                ? { ...z, zoneName: zoneData.name, description: zoneData.description }
                : z
            ),
          };
        }

        const newZone: ApiZone = {
          id: crypto.randomUUID(),
          zoneName: zoneData.name,
          description: zoneData.description,
          locationsCount: 0,
          camerasCount: 0,
          locations: [],
        };

        return { ...prev, zones: [...prev.zones, newZone] };
      });
      dispatch(showToast({ id: crypto.randomUUID(), message: "Mock zone saved.", severity: "success" }));
      return;
    }

    try {
      if (zoneData.id) {
        await updateZone({
          id: zoneData.id,
          data: {
            zoneName: zoneData.name,
            description: zoneData.description ?? "",
          },
        }).unwrap();
      } else {
        await createZone({
          zoneName: zoneData.name,
          description: zoneData.description ?? "",
        }).unwrap();
      }
    } catch (err) {
      console.error("Failed to save zone", err);
    }
  };

  // Assign locations (open drawer)
  const handleAssignLocations = (zone: ZoneType) => {
    setSelectedZone(zone);
    setLocationsDrawerOpen(true);
  };

  // Save locations
  const handleSaveLocations = async (zoneId: string, locations: LocationItem[]) => {
    if (USE_MOCK) {
      setMockZones((prev) => ({
        ...prev,
        zones: prev.zones.map((z) => {
          if (z.id !== zoneId) return z;
          const newLocations: ApiLocation[] = locations.map((loc) => ({
            id: loc.id,
            zoneId,
            locationName: loc.name,
            description: loc.description,
          }));
          const mergedLocations = [...(z.locations ?? []), ...newLocations];
          return { ...z, locations: mergedLocations, locationsCount: mergedLocations.length };
        }),
      }));
      dispatch(showToast({ id: crypto.randomUUID(), message: "Mock locations saved.", severity: "success" }));
      return;
    }

    try {
      for (const loc of locations) {
        await createLocation({
          zoneId,
          locationName: loc.name,
          description: loc.description ?? "",
        }).unwrap();
      }
    } catch (err) {
      console.error("Failed to create location", err);
    }
  };

  // Calculate stats
  const totalZones = zones.length;
  const configuredZones = zones.filter((z) => (z.locationsCount ?? 0) > 0 || (z.camerasCount ?? 0) > 0).length;
  const totalLocations = zones.reduce((sum, z) => sum + (z.locationsCount ?? 0), 0);

  // Loading state
  if (!USE_MOCK && isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading zones...</Typography>
      </Container>
    );
  }

  // Error state
  if (!USE_MOCK && error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load zones. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Header */}
      

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2, mb: 3 }}>
        <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: "rgba(25,118,210,0.08)", border: "2px solid", borderColor: "primary.main", display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="h3" fontWeight={700} color="primary.main">{totalZones}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Zones</Typography>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: "rgba(46,125,50,0.08)", border: "2px solid", borderColor: "success.main", display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="h3" fontWeight={700} color="success.main">{configuredZones}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>Configured</Typography>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: "rgba(2,136,209,0.08)", border: "2px solid", borderColor: "info.main", display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="h3" fontWeight={700} color="info.main">{totalLocations}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>Location Assignments</Typography>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: "rgba(237,108,2,0.08)", border: "2px solid", borderColor: "warning.main", display: "flex", flexDirection: "column", gap: 0.5 }}>
          {/* intentionally left for future camera stats */}
        </Box>
      </Box>

      {/* Search and Add */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          fullWidth
          placeholder="Search zones by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) } }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { backgroundColor: "white" } }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddZone}
          sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
          disabled={isCreating}
        >
          Add Zone
        </Button>
      </Box>

      {/* Zone Table */}
      {filteredZones.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {searchQuery ? "No zones match your search criteria." : "No zones created yet. Click 'Add Zone' to get started."}
        </Alert>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing <strong>{filteredZones.length}</strong> of <strong>{zones.length}</strong> zones
          </Typography>

          <ZoneTable
            zones={filteredZones}
            onAssignLocations={handleAssignLocations}
            onEdit={handleEditZone}
            onDelete={handleDeleteZone}
          />
        </Box>
      )}

      {/* Add/Edit Zone Drawer */}
      <AddEditZoneDrawer
        open={addEditDrawerOpen}
        onClose={() => setAddEditDrawerOpen(false)}
        zone={selectedZone}
        onSave={handleSaveZone}
      />

      {/* Assign Locations Drawer */}
      <AssignLocationsDrawer
        open={locationsDrawerOpen}
        onClose={() => setLocationsDrawerOpen(false)}
        zone={selectedZone}
        existingLocations={
  (selectedZone?.locations ?? []).map((l) => ({
    id: l.id,
    name: l.locationName,        // ✅ FIX HERE
    description: l.description, // ✅ FIX HERE
  }))
}

        onSave={handleSaveLocations}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(zoneToDelete)} onClose={() => setZoneToDelete(null)}>
        <DialogTitle>Delete Zone?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{zoneToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneToDelete(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ZoneLocationMapping;
