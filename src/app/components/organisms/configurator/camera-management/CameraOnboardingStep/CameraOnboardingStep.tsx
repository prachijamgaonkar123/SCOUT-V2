"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Videocam as VideocamIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";


import {
  useAddCameraMutation,
  useDetectNvrChannelsMutation,
  useGetLocationsByZoneQuery,
  useLazyGetLocationsByZoneQuery,
  useGetCameraZonesQuery

} from "@/app/(protectedRoutes)/(settings)/(configurator)/cameraManagement/CameraManagementApi";


import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import type { OnboardingCamera, CameraApiResponse } from "@/app/types/camera";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const MOCK_ZONES = [
  { id: "zone-1", zoneName: "Manufacturing Floor" },
  { id: "zone-2", zoneName: "Warehouse" },
  { id: "zone-3", zoneName: "Perimeter" },
  { id: "zone-4", zoneName: "Office Block" },
];

const EMPTY_LOCATIONS: { id: string; locationName: string }[] = [];

const MOCK_LOCATIONS_BY_ZONE: Record<string, { id: string; locationName: string }[]> = {
  "zone-1": [
    { id: "loc-1", locationName: "Assembly Line 1" },
    { id: "loc-2", locationName: "Assembly Line 2" },
  ],
  "zone-2": [
    { id: "loc-5", locationName: "Loading Dock" },
    { id: "loc-6", locationName: "Storage Rack A" },
  ],
  "zone-3": [
    { id: "loc-8", locationName: "Main Gate" },
    { id: "loc-9", locationName: "Rear Gate" },
  ],
  "zone-4": [],
};
interface LocationOption {
  id: string;
  locationName: string;
}
interface AssignmentItem {
  channel: number;
  rtspUrl: string;
  cameraName: string;
  cameraIp: string;
  username: string;
  password: string;
  port: string;
  zoneId: string;
  locationId: string;
  locationOptions: LocationOption[]; // list of locations for selected zone
}

interface CameraOnboardingStepProps {
  cameras: OnboardingCamera[];

  onCameraAdd?: (camera: CameraApiResponse) => void;

  onCameraRemove: (cameraId: string) => void;

  onNext: () => void;
  onBack: () => void;
  isOptional?: boolean;
}

interface CameraFormData {
  ipAddress: string;
  username: string;
  cameraname: string;
  password: string;
  port: string;
  zoneId: string;
  locationId: string;
  rtspUrl: string;
}

interface FormErrors {
  ipAddress?: string;
  cameraname?: string;
  username?: string;
  password?: string;
  port?: string;
  rtspUrl?: string;
}

const CameraOnboardingStep: React.FC<CameraOnboardingStepProps> = ({
  cameras,
  onCameraAdd,
  onCameraRemove,
  onNext,
  onBack,
  isOptional = false,
}) => {
  const [formData, setFormData] = useState<CameraFormData>({
    ipAddress: "",
    username: "",
    cameraname: "",
    password: "",
    port: "554",
    zoneId: "",
    locationId: "",
    rtspUrl: "",
  });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<
    AssignmentItem[]
  >([]);

  const [selectedZone, setSelectedZone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  type ZoneItem = {
    id: string;
    zoneName: string;
  };

  type LocationItem = {
    id: string;
    locationName: string;
  };

  const [zoneList, setZoneList] = useState<ZoneItem[]>([]);
  const [locationList, setLocationList] = useState<LocationItem[]>([]);
  const [fetchLocationsByZone] = useLazyGetLocationsByZoneQuery();

  const [errors, setErrors] = useState<FormErrors>({});
  const [isAdding, setIsAdding] = useState(false);
  const [leftColumnHeight, setLeftColumnHeight] = useState<number>(0);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  // Toggle mode: 'camera' | 'nvr'
  const [mode, setMode] = useState<"camera" | "nvr">("camera");

  //camera discovering
  const [isDiscovering, setIsDiscovering] = useState(false);

  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<string | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | info | warning
  });

  type ToastSeverity = "success" | "error" | "info" | "warning";

  const showToast = (message: string, severity: ToastSeverity = "success") => {
    setToast({ open: true, message, severity });
  };

  // NVR Form state
  const [nvrData, setNvrData] = useState({
    nvrBrand: "hikvision",
    name: "",
    ip: "",
    port: "8000",
    username: "",
    password: "",
    numberofchannels: "",
    rtsplink: "",
  });

  type NvrCamera = {
    channel: number;
    rtspUrl: string;
  };

  const [nvrCameras, setNvrCameras] = useState<NvrCamera[]>([]);

  const [selectedNvrCams, setSelectedNvrCams] = useState<number[]>([]);
  const { data: zonesDataApi } = useGetCameraZonesQuery(undefined, { skip: USE_MOCK });
  const zonesData = USE_MOCK ? MOCK_ZONES : zonesDataApi;

  const [addCamera] = useAddCameraMutation();
  const [detectNvrChannels] = useDetectNvrChannelsMutation();

  const extractRtspChannelNumber = (rtspUrl: string): number => {
    const match = /Channels\/(\d+)/.exec(rtspUrl);
    return match ? Number(match[1]) : -1;
  };


  // const isDuplicateNvrCamera = (
  //   ip: string,
  //   channel: number,
  //   cameras: OnboardingCamera[]
  // ) => {
  //   return cameras.some(cam => {
  //     if (cam.ipAddress !== ip) return false;

  //     // Extract channel from existing camera name
  //     // Example: MainNVR-CH-1
  //     const match = cam.cameraname?.match(/CH-(\d+)/);
  //     const existingChannel = match ? Number(match[1]) : null;

  //     return existingChannel === channel;
  //   });
  // };




  useEffect(() => {
    if (Array.isArray(zonesData)) {
      setZoneList(zonesData);
    }
  }, [zonesData]);


  const { data: locationsDataApi } = useGetLocationsByZoneQuery(selectedZone, {
    skip: USE_MOCK || !selectedZone,
  });
  const locationsData = USE_MOCK ? MOCK_LOCATIONS_BY_ZONE[selectedZone] ?? EMPTY_LOCATIONS : locationsDataApi;

  useEffect(() => {
    if (Array.isArray(locationsData)) {
      setLocationList(locationsData);
    }
  }, [locationsData]);



  useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        const height = leftColumnRef.current.offsetHeight;
        setLeftColumnHeight(height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Use timeout to ensure content is rendered
    setTimeout(updateHeight, 100);

    return () => window.removeEventListener("resize", updateHeight);
  }, [cameras, formData]);

  const isValidIPv4 = (ip: string): boolean => {
    const octet = "(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)";
    const ipv4Regex = new RegExp(`^${octet}(\\.${octet}){3}$`);
    return ipv4Regex.test(ip);
  };

  const isValidIPv6 = (ip: string): boolean => {
    const ipv6Regex = /^([a-fA-F0-9]{1,4}:){2,7}[a-fA-F0-9]{1,4}$/;
    return ipv6Regex.test(ip);
  };

  const isDuplicateIP = (ip: string): boolean => {
    return cameras?.some((camera) => camera.ipAddress === ip.trim());
  };

  const isDuplicateName = (name: string): boolean => {
    return (
      cameras?.some((camera) => camera.cameraname.trim() === name.trim()) ??
      false
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // IP Address validation
    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = "IP Address is required";
    } else {
      const trimmedIP = formData.ipAddress.trim();

      // Check if it's a valid IPv4 or IPv6 address
      if (!isValidIPv4(trimmedIP) && !isValidIPv6(trimmedIP)) {
        newErrors.ipAddress = "Please enter a valid IPv4 or IPv6 address";
      }
      // Check for duplicate IP
      else if (isDuplicateIP(trimmedIP)) {
        newErrors.ipAddress = "This IP address is already added";
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.cameraname.trim()) {
      newErrors.cameraname = "Camera name is required";
    } else if (isDuplicateName(formData.cameraname.trim())) {
      newErrors.cameraname = "This camera name already exists";
    }

    if (!formData.port.trim()) {
      newErrors.port = "Port is required";
    } else if (
      isNaN(Number(formData.port)) ||
      Number(formData.port) < 1 ||
      Number(formData.port) > 65535
    ) {
      newErrors.port = "Port must be a number between 1 and 65535";
    }
    if (!formData.rtspUrl.trim()) {
      newErrors.rtspUrl = "RTSP URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof CameraFormData) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));

        // Clear error when user starts typing
        // if (errors[field]) {
        //   setErrors(prev => ({ ...prev, [field]: undefined }));
        // }
      };

  const handleAddCamera = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsAdding(true);

    try {
      if (USE_MOCK) {
        onCameraAdd?.({
          id: crypto.randomUUID(),
          cameraIp: formData.ipAddress.trim(),
          cameraName: formData.cameraname.trim(),
          userName: formData.username.trim(),
          password: formData.password.trim(),
          RTSPport: formData.port.trim(),
          rtspStream: formData.rtspUrl.trim(),
          cameraZone: zoneList.find((z) => z.id === selectedZone)?.zoneName ?? "",
          cameraLocation:
            locationList.find((l) => l.id === selectedLocation)?.locationName ?? "",
          connectionType: "DIRECT_TO_CAMERA",
        });
      } else {
        await addCamera({
          cameraIp: formData.ipAddress.trim(),
          cameraName: formData.cameraname.trim(),
          userName: formData.username.trim(),
          password: formData.password.trim(),
          RTSPport: formData.port.trim(),
          rtspUrl: formData.rtspUrl.trim(),
          cameraZone: zoneList.find((z) => z.id === selectedZone)?.zoneName ?? "",
          cameraLocation:
            locationList.find((l) => l.id === selectedLocation)?.locationName ?? "",

          channel: null,
          refreshRate: 10,
          connectionType: "DIRECT_TO_CAMERA",
        }).unwrap();
      }

      showToast("Camera added successfully!", "success");

      setFormData({
        ipAddress: "",
        cameraname: "",
        username: "",
        password: "",
        port: "554",
        zoneId: "",
        locationId: "",
        rtspUrl: "",
      });
      setSelectedZone("");
      setSelectedLocation("");
    } catch (error: unknown) {
      console.error("Add camera error:", error);

      // const message =
      //   error?.data?.message ||
      //   error?.message ||
      //   "Failed to add camera";

      // showToast(message, "error");

      let message = "Failed to add camera";

      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error
      ) {

        const err = error as {
          data?: { message?: string };
          message?: string;
        };

        message =
          err.data?.message ||
          err.message ||
          message;
      }

      showToast(message, "error");
    }
    setIsAdding(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      default:
        return <VideocamIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };



  const handleSaveAssignments = async () => {


    setIsSavingAssignments(true);
    try {
      for (const cam of pendingAssignments) {

        // if (isDuplicateNvrCamera(nvrData.ip, cam.channel, cameras)) {
        //   showToast(
        //     `Duplicate camera skipped (IP: ${nvrData.ip}, Channel: ${cam.channel})`,
        //     "error"
        //   );
        //   continue;
        // }
        if (!cam.zoneId) {
          alert(`Please select zone for ${cam.cameraName}`);
          return;
        }
        if (!cam.locationId) {
          alert(`Please select location for ${cam.cameraName}`);
          return;
        }

        const payload = {
          // cameraName: `${cam.cameraName}-${cam.channel}`,
          cameraName: `${cam.cameraName}`,
          // cameraIp: `${nvrData.ip}-${cam.channel}`,
          cameraIp: `${nvrData.ip}`,
          // do NOT add channel here
          userName: cam.username,
          password: cam.password,
          RTSPport: cam.port,
          channel: cam.channel,
          rtspUrl: cam.rtspUrl,
          cameraZone: zoneList.find((z) => z.id === cam.zoneId)?.zoneName ?? "",
          cameraLocation:
            cam.locationOptions.find((l) => l.id === cam.locationId)
              ?.locationName ?? "",
          connectionType: "NVR" as const,
          refreshRate: 10,
        };

        console.log("Final payload:", payload);
        if (USE_MOCK) {
          onCameraAdd?.({
            id: crypto.randomUUID(),
            cameraIp: payload.cameraIp,
            cameraName: payload.cameraName,
            userName: payload.userName,
            password: payload.password,
            RTSPport: payload.RTSPport,
            rtspStream: payload.rtspUrl,
            cameraZone: payload.cameraZone,
            cameraLocation: payload.cameraLocation,
            connectionType: payload.connectionType,
          });
        } else {
          await addCamera(payload).unwrap();
        }
      }

      showToast("NVR cameras added successfully!", "success");
      setPendingAssignments([]);
      setAssignDialogOpen(false);
      setSelectedNvrCams([]);
      setNvrCameras([]);

      setNvrData({
        name: "",
        nvrBrand: "",
        ip: "",
        port: "8000",
        username: "",
        password: "",
        numberofchannels: "",
        rtsplink: "",
      });
    } catch (error) {
      console.error("Error saving NVR assignments:", error);
    }

    setIsSavingAssignments(false);
  };


  const handleAssignmentZoneChange = async (index: number, zoneId: string) => {
    const updated = [...pendingAssignments];

    updated[index].zoneId = zoneId;
    updated[index].locationId = "";
    updated[index].locationOptions = [];
    setPendingAssignments(updated);

    if (USE_MOCK) {
      updated[index].locationOptions = MOCK_LOCATIONS_BY_ZONE[zoneId] ?? [];
      setPendingAssignments([...updated]);
      return;
    }

    try {
      const res = await fetchLocationsByZone(zoneId).unwrap();
      updated[index].locationOptions = Array.isArray(res) ? res : [];
      setPendingAssignments([...updated]);
    } catch (err) {
      console.error("Failed to load locations", err);
      updated[index].locationOptions = [];
      setPendingAssignments([...updated]);
    }
  };


  const handleNvrCameraToggle = (channel: number) => {
    setSelectedNvrCams((prev) =>
      prev.includes(channel)
        ? prev.filter((ch) => ch !== channel)
        : [...prev, channel]
    );
  };

  return (
    <Box sx={{ p: 1, minHeight: 400, pb: 12 }}>
      <Typography variant="h6" gutterBottom>
        {isOptional ? "Camera Setup (Optional)" : "Camera Onboarding"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isOptional
          ? "Add cameras now or skip this step. You can always add and configure cameras later from the organization management page."
          : "Add cameras to your organization for monitoring and analytics"}
      </Typography>

      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {/* Left Column - CSV Upload & Manual Add */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box
            ref={leftColumnRef}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Add Camera Manually Form */}
            {/* NEW TOGGLE + CAMERA/NVR FORM SECTION */}
            <Card variant="outlined">
              <CardContent>
                {/* Toggle Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Button
                    variant={mode === "camera" ? "contained" : "outlined"}
                    onClick={() => setMode("camera")}
                    fullWidth
                  >
                    Add Camera Manually
                  </Button>

                  <Button
                    variant={mode === "nvr" ? "contained" : "outlined"}
                    onClick={() => setMode("nvr")}
                    fullWidth
                  >
                    Add NVR
                  </Button>
                </Box>

                {/* CAMERA FORM (Existing) */}
                {mode === "camera" && (
                  <>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      Add Camera Manually
                    </Typography>

                    <form onSubmit={handleAddCamera}>
                      <Grid container spacing={2}>

                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="Camera name"
                            value={formData.cameraname}
                            onChange={handleInputChange("cameraname")}
                            error={!!errors.cameraname}
                            helperText={errors.cameraname}
                            required
                            fullWidth
                            size="small"
                          />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="IP Address"
                            value={formData.ipAddress}
                            onChange={handleInputChange("ipAddress")}
                            error={!!errors.ipAddress}
                            helperText={errors.ipAddress}
                            required
                            fullWidth
                            size="small"
                          />
                        </Grid>



                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Username"
                            value={formData.username}
                            onChange={handleInputChange("username")}
                            error={!!errors.username}
                            helperText={errors.username}
                            required
                            fullWidth
                            size="small"
                          />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            error={!!errors.password}
                            helperText={errors.password}
                            required
                            fullWidth
                            size="small"
                          />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Port"
                            value={formData.port}
                            onChange={handleInputChange("port")}
                            error={!!errors.port}
                            helperText={errors.port}
                            required
                            fullWidth
                            size="small"
                          />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <TextField
                            select
                            value={selectedZone}
                            onChange={(e) => {
                              setSelectedZone(e.target.value);
                              setSelectedLocation("");
                            }}
                            fullWidth
                            size="small"
                            slotProps={{
                              select: { native: true },
                            }}
                          >
                            <option value="">Select Zone</option>
                            {zoneList.map((zone) => (
                              <option key={zone.id} value={zone.id}>
                                {zone.zoneName}
                              </option>
                            ))}
                          </TextField>
                        </Grid>



                        <Grid size={{ xs: 6 }}>
                          <TextField
                            select
                            value={selectedLocation}
                            onChange={(e) =>
                              setSelectedLocation(e.target.value)
                            }
                            fullWidth
                            size="small"
                            slotProps={{
                              select: { native: true },
                            }}
                            disabled={!selectedZone}
                          >
                            <option value="">Select Location</option>
                            {locationList.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.locationName}
                              </option>
                            ))}
                          </TextField>
                        </Grid>

                        {/* <Grid size={{ xs: 12 }}>
                        <TextField
                          label="rtsp link"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.rtsplink}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, rtsplink: e.target.value })
                          }
                        />
                      </Grid> */}

                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="RTSP URL"
                            required
                            fullWidth
                            size="small"
                            value={formData.rtspUrl}
                            onChange={handleInputChange("rtspUrl")}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isAdding}
                          >
                            {isAdding ? "Adding Camera..." : "Add Camera"}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </>
                )}

                {/* NVR FORM */}
                {mode === "nvr" && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Add NVR
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="NVR Name"
                          fullWidth
                          size="small"
                          value={nvrData.name}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, name: e.target.value })
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          select
                          label="NVR Brand"
                          fullWidth
                          size="small"
                          value={nvrData.nvrBrand}
                          onChange={(e) =>
                            setNvrData({
                              ...nvrData,
                              nvrBrand: e.target.value,
                            })
                          }
                          slotProps={{
                            select: { native: true },
                          }}
                        >
                          <option value="hikvision">
                            Hikvision
                          </option>

                          <option value="prama">
                            Prama
                          </option>

                          <option value="dahua">
                            Dahua
                          </option>

                          <option value="cpplus">
                            CP Plus
                          </option>

                          <option value="uniview">
                            Uniview
                          </option>

                          <option value="matrix">
                            Matrix
                          </option>

                          <option value="generic">
                            Generic
                          </option>
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="NVR IP Address"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.ip}
                          onChange={(e) =>
                            setNvrData({
                              ...nvrData,
                              ip: e.target.value,
                            })
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Port"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.port}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, port: e.target.value })
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Username"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.username}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, username: e.target.value })
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Password"
                          required
                          type="password"
                          fullWidth
                          size="small"
                          value={nvrData.password}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, password: e.target.value })
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="No of channels"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.numberofchannels}
                          onChange={(e) =>
                            setNvrData({
                              ...nvrData,
                              numberofchannels: e.target.value,
                            })
                          }
                        />
                      </Grid>

                      {/* <Grid size={{ xs: 12 }}>
                        <TextField
                          label="rtsp link"
                          required
                          fullWidth
                          size="small"
                          value={nvrData.rtsplink}
                          onChange={(e) =>
                            setNvrData({ ...nvrData, rtsplink: e.target.value })
                          }
                        />
                      </Grid> */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="RTSP URL"
                          required
                          fullWidth
                          size="small"
                          value={formData.rtspUrl}
                          onChange={handleInputChange("rtspUrl")}
                        />
                      </Grid>
                    </Grid>

                    {/* Discover Cameras */}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      // onClick={() => {
                      //   // MOCK RESPONSE
                      //   setNvrCameras([
                      //     { id: "1", name: "Channel 1 - Front Gate" },
                      //     { id: "2", name: "Channel 2 - Entrance" },
                      //     { id: "3", name: "Channel 3 - Parking Area" },
                      //   ]);
                      // }}

                      onClick={async () => {
                        try {
                          setIsDiscovering(true);

                          const activeChannels = USE_MOCK
                            ? Array.from(
                                { length: Math.min(Number(nvrData.numberofchannels) || 4, 8) },
                                (_, i) => ({
                                  channel: i + 1,
                                  rtspUrl: `rtsp://${nvrData.ip || "192.168.1.100"}/Channels/${i + 1}`,
                                })
                              )
                            : (
                                await detectNvrChannels({
                                  nvrName: nvrData.name,
                                  brandName: nvrData.nvrBrand,
                                  ip: nvrData.ip,
                                  port: Number(nvrData.port),
                                  username: nvrData.username,
                                  password: nvrData.password,
                                  numberofchannels: Number(nvrData.numberofchannels),
                                  rtsplink: nvrData.rtsplink,
                                }).unwrap()
                              ).activeChannels;

                          if (!Array.isArray(activeChannels) || activeChannels.length === 0) {
                            showToast(
                              "No active cameras found. Invalid RTSP or incorrect credentials.",
                              "error"
                            );
                            setNvrCameras([]);
                            return;
                          }

                          const mappedCameras: NvrCamera[] = activeChannels.map((cam) => ({
                            channel: cam.channel,
                            rtspUrl: cam.rtspUrl,
                          }));


                          setNvrCameras(mappedCameras);


                        } catch (error) {
                          console.error("Detect NVR Error:", error);
                        } finally {
                          setIsDiscovering(false);
                        }
                      }}
                    >
                      {isDiscovering ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <CircularProgress size={22} sx={{ color: "white" }} />
                        </Box>
                      ) : (
                        "Discover Cameras"
                      )}
                    </Button>

                    {/* Show discovered cameras */}
                    {nvrCameras.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Found Cameras:
                        </Typography>

                        {nvrCameras.map((camera) => (
                          <Box
                            key={camera.channel}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedNvrCams.includes(camera.channel)}
                              onChange={() =>
                                handleNvrCameraToggle(camera.channel)
                              }
                            />
                            <Typography>{`${nvrData.ip} - ${camera.channel}`}</Typography>
                          </Box>
                        ))}

                        {/* Add Selected Cameras */}
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          sx={{ mt: 2 }}
                          disabled={selectedNvrCams.length === 0}
                          onClick={() => {
                            const selected = nvrCameras.filter((cam) =>
                              selectedNvrCams.includes(cam.channel)
                            );

                            const mapped = selected
                              .filter(cam => {
                                // const channel = extractRtspChannelNumber(cam.rtspUrl);

                                return true;
                              })

                              .map(cam => ({
                                channel: extractRtspChannelNumber(cam.rtspUrl),
                                rtspUrl: cam.rtspUrl,
                                cameraName: `${nvrData.name}-CH-${extractRtspChannelNumber(cam.rtspUrl)}`,
                                cameraIp: nvrData.ip,
                                username: nvrData.username,
                                password: nvrData.password,
                                port: nvrData.port,
                                zoneId: "",
                                locationId: "",
                                locationOptions: [],
                              }));

                            if (mapped.length === 0) return;

                            setPendingAssignments(mapped);
                            setAssignDialogOpen(true);
                          }}

                        >
                          Add Selected Cameras
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          <Dialog
            open={assignDialogOpen}
            onClose={() => setAssignDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Assign Zone & Location</DialogTitle>

            <DialogContent dividers>
              {pendingAssignments.map((cam, index) => (
                <Box key={cam.channel} sx={{ display: "flex", gap: 2, my: 1 }}>
                  <Typography
                    sx={{
                      width: "25%",
                    }}
                  >
                    {cam.cameraName}
                  </Typography>

                  <TextField
                    select
                    value={cam.zoneId}
                    onChange={(e) =>
                      handleAssignmentZoneChange(index, e.target.value)
                    }
                    slotProps={{
                      select: { native: true },
                    }}
                    sx={{ width: "30%" }}
                  >
                    <option value="">Select Zone</option>
                    {zoneList.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.zoneName}
                      </option>
                    ))}
                  </TextField>

                  <TextField
                    select
                    value={cam.locationId}
                    onChange={(e) => {
                      const updated = [...pendingAssignments];
                      updated[index].locationId = e.target.value;
                      setPendingAssignments(updated);
                    }}
                    slotProps={{
                      select: { native: true },
                    }}
                    sx={{ width: "30%" }}
                    disabled={!cam.zoneId}
                  >
                    <option value="">Select Location</option>
                    {(cam.locationOptions ?? []).map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.locationName}
                      </option>
                    ))}
                  </TextField>
                </Box>
              ))}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveAssignments}>
                {isSavingAssignments ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Save & Add Cameras"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: { borderRadius: 1, p: 1 },
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
              fontSize: "1.1rem",
              pb: 1,
            }}
          >
            <WarningAmberIcon color="warning" />
            Confirm Delete
          </DialogTitle>

          <DialogContent sx={{ py: 1 }}>
            <Typography sx={{ color: "#444", fontSize: ".9rem" }}>
              Are you sure you want to delete this camera? This action{" "}
              <b>cannot be undone</b>.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              // color="#c71e1eff"
              sx={{ borderRadius: 1 }}
              onClick={() => {
                if (cameraToDelete) {
                  onCameraRemove(cameraToDelete);
                  showToast("Camera deleted successfully!", "success");
                }
                setDeleteDialogOpen(false);
                setCameraToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={
              toast.severity as "success" | "error" | "info" | "warning"
            }
            variant="filled"
            sx={{ width: "100%", borderRadius: "8px" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

        {/* Right Column - Onboarded Cameras List */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            variant="outlined"
            sx={{
              height: leftColumnHeight > 0 ? `${leftColumnHeight}px` : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                p: 2,
                "&:last-child": { pb: 2 },
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <VideocamIcon color="primary" />
                Onboarded Cameras ({cameras?.length ?? 0})
              </Typography>

              {!cameras || cameras.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                  {isOptional
                    ? "No cameras added yet. You can skip this step and add cameras later, or add cameras now using the form or CSV upload."
                    : "No cameras added yet. Add cameras to proceed to AI configuration."}
                </Alert>
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    mt: 1,
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,.2)",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,.3)",
                      },
                    },
                  }}
                >
                  <List dense disablePadding>
                    {cameras.map((camera, index) => (
                      <React.Fragment key={camera.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setCameraToDelete(camera.id);
                                setDeleteDialogOpen(true);
                              }}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mr: 2,
                            }}
                          >
                            {getStatusIcon(camera.status)}
                          </Box>

                          <ListItemText
                            primary={
                              <Chip
                                label={camera.status}
                                color={getStatusColor(camera.status)}
                                size="small"
                              />
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {camera.ipAddress}:{camera.port} (
                                {camera.cameraname})
                              </Typography>
                            }
                          />
                        </ListItem>

                        {index < (cameras?.length ?? 0) - 1 && (
                          <Divider component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* <Box sx={{ display: 'flex', position:'fixed', justifyContent: 'space-between', mt: 4 }}> */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          backgroundColor: "white",
          borderTop: "1px solid #e0e0e0",
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        <Button onClick={onBack} color="inherit">
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isOptional && (
            <Button onClick={onNext} variant="outlined">
              Skip Camera Setup
            </Button>
          )}
          <Button onClick={onNext} variant="contained">
            {isOptional ? "Continue with Cameras" : "Next: AI Configuration"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CameraOnboardingStep;
