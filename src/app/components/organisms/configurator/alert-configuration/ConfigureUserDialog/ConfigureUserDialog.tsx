"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  HealthAndSafety as SafetyIcon,
  Security as SecurityIcon,
  Groups as WorkforceIcon,
  Factory as OperationalIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import {
  ScoutUser,
  UseCaseCategory,
  UseCaseSummary,
  UserAlertConfig,
  AlertChannels,
  NotificationChannel,
  NotificationMode,
} from "@/app/types/alertConfig";

export interface ConfigureUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: ScoutUser | null;
  categories: UseCaseCategory[];
  useCases: UseCaseSummary[];
  existingConfig: UserAlertConfig | null;
  onSave: (config: UserAlertConfig) => void;
  isSaving?: boolean;
}

const STEPS = ["Select category", "Select use cases", "Configure channels"];

const DEFAULT_CHANNELS: AlertChannels = { email: true, whatsapp: false, sms: false };
const DEFAULT_NOTIFICATION_MODE: NotificationMode = "per_event";

const NOTIFICATION_MODE_OPTIONS: { value: NotificationMode; label: string }[] = [
  { value: "per_event", label: "Per event" },
  { value: "hourly", label: "Hourly digest" },
  { value: "daily", label: "Daily digest" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "cat-safety": <SafetyIcon />,
  "cat-security": <SecurityIcon />,
  "cat-workforce": <WorkforceIcon />,
  "cat-operational": <OperationalIcon />,
};

const UNAVAILABLE_TOOLTIP = "This use case is not included in your organization's subscription.";

const CHANNEL_COLUMNS: { key: NotificationChannel; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "email", label: "Email", icon: <EmailIcon fontSize="small" />, color: "#0B5FA5" },
  { key: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon fontSize="small" />, color: "#1E7B34" },
  { key: "sms", label: "SMS", icon: <SmsIcon fontSize="small" />, color: "#B5560A" },
];

export const ConfigureUserDialog: React.FC<ConfigureUserDialogProps> = ({
  open,
  onClose,
  user,
  categories,
  useCases,
  existingConfig,
  onSave,
  isSaving = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedUseCaseIds, setSelectedUseCaseIds] = useState<string[]>([]);
  const [channelsByUseCaseId, setChannelsByUseCaseId] = useState<Record<string, AlertChannels>>({});
  const [notificationModeByUseCaseId, setNotificationModeByUseCaseId] = useState<Record<string, NotificationMode>>({});

  useEffect(() => {
    if (!open) return;

    const existingUseCaseIds = existingConfig?.subscriptions.map((s) => s.usecaseId) ?? [];
    const existingCategoryIds = Array.from(
      new Set(
        existingUseCaseIds
          .map((id) => useCases.find((uc) => uc.id === id)?.categoryId)
          .filter((id): id is string => Boolean(id))
      )
    );
    const existingChannels = (existingConfig?.subscriptions ?? []).reduce<Record<string, AlertChannels>>(
      (acc, sub) => {
        acc[sub.usecaseId] = sub.channels;
        return acc;
      },
      {}
    );
    const existingNotificationModes = (existingConfig?.subscriptions ?? []).reduce<Record<string, NotificationMode>>(
      (acc, sub) => {
        acc[sub.usecaseId] = sub.notificationMode;
        return acc;
      },
      {}
    );

    setActiveStep(0);
    setSelectedCategoryIds(existingCategoryIds);
    setSelectedUseCaseIds(existingUseCaseIds);
    setChannelsByUseCaseId(existingChannels);
    setNotificationModeByUseCaseId(existingNotificationModes);
  }, [open, existingConfig, useCases]);

  const useCasesByCategory = useMemo(() => {
    const map: Record<string, UseCaseSummary[]> = {};
    categories.forEach((cat) => {
      map[cat.id] = useCases.filter((uc) => uc.categoryId === cat.id);
    });
    return map;
  }, [categories, useCases]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleUseCase = (useCaseId: string) => {
    const useCase = useCases.find((uc) => uc.id === useCaseId);
    if (useCase?.available === false) return;
    setSelectedUseCaseIds((prev) => {
      if (prev.includes(useCaseId)) {
        return prev.filter((id) => id !== useCaseId);
      }
      setChannelsByUseCaseId((channels) => ({
        ...channels,
        [useCaseId]: channels[useCaseId] ?? DEFAULT_CHANNELS,
      }));
      setNotificationModeByUseCaseId((modes) => ({
        ...modes,
        [useCaseId]: modes[useCaseId] ?? DEFAULT_NOTIFICATION_MODE,
      }));
      return [...prev, useCaseId];
    });
  };

  const selectAllInCategory = (categoryId: string) => {
    const ids =
      useCasesByCategory[categoryId]
        ?.filter((uc) => uc.available !== false)
        .map((uc) => uc.id) ?? [];
    setSelectedUseCaseIds((prev) => Array.from(new Set([...prev, ...ids])));
    setChannelsByUseCaseId((channels) => {
      const next = { ...channels };
      ids.forEach((id) => {
        next[id] = next[id] ?? DEFAULT_CHANNELS;
      });
      return next;
    });
    setNotificationModeByUseCaseId((modes) => {
      const next = { ...modes };
      ids.forEach((id) => {
        next[id] = next[id] ?? DEFAULT_NOTIFICATION_MODE;
      });
      return next;
    });
  };

  const toggleChannel = (useCaseId: string, channel: NotificationChannel) => {
    setChannelsByUseCaseId((prev) => ({
      ...prev,
      [useCaseId]: {
        ...(prev[useCaseId] ?? DEFAULT_CHANNELS),
        [channel]: !(prev[useCaseId] ?? DEFAULT_CHANNELS)[channel],
      },
    }));
  };

  const setNotificationMode = (useCaseId: string, mode: NotificationMode) => {
    setNotificationModeByUseCaseId((prev) => ({ ...prev, [useCaseId]: mode }));
  };

  const handleSave = () => {
    if (!user) return;

    onSave({
      userId: user.id,
      subscriptions: selectedUseCaseIds.map((usecaseId) => ({
        usecaseId,
        channels: channelsByUseCaseId[usecaseId] ?? DEFAULT_CHANNELS,
        notificationMode: notificationModeByUseCaseId[usecaseId] ?? DEFAULT_NOTIFICATION_MODE,
      })),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const canGoNext = activeStep === 0 ? selectedCategoryIds.length > 0 : selectedUseCaseIds.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: "0.85rem", fontWeight: 700 }}>
            {user?.firstName[0]}
            {user?.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Configure Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.firstName} {user?.lastName} · {user?.roleName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Box sx={{ px: 4, py: 2.5, backgroundColor: "#fafbfc" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      <DialogContent sx={{ minHeight: 380, p: 3 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select one or more use case categories to configure for this user.
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                const categoryUseCases = useCasesByCategory[category.id] ?? [];
                const total = categoryUseCases.length;
                const availableCount = categoryUseCases.filter((uc) => uc.available !== false).length;
                const selectedInCategory = categoryUseCases.filter((uc) =>
                  selectedUseCaseIds.includes(uc.id)
                ).length;

                return (
                  <Box
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    sx={{
                      position: "relative",
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      backgroundColor: isSelected ? "rgba(25, 118, 210, 0.06)" : "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      transition: "all 0.15s",
                      boxShadow: isSelected ? "0 0 0 1px rgba(25, 118, 210, 0.3)" : "none",
                      "&:hover": { borderColor: "primary.light", boxShadow: 1 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        backgroundColor: isSelected ? "primary.main" : "action.hover",
                        color: isSelected ? "white" : "text.secondary",
                      }}
                    >
                      {CATEGORY_ICONS[category.id] ?? <CategoryIcon />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {availableCount < total
                          ? `${availableCount} of ${total} available`
                          : `${total} use case${total === 1 ? "" : "s"}`}
                        {selectedInCategory > 0 && ` · ${selectedInCategory} selected`}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon color="primary" sx={{ position: "absolute", top: 10, right: 10, fontSize: 20 }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedUseCaseIds.length} use case{selectedUseCaseIds.length === 1 ? "" : "s"} selected
            </Typography>
            {selectedCategoryIds.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              const categoryUseCases = useCasesByCategory[categoryId] ?? [];

              return (
                <Box key={categoryId} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: 0.4 }}
                    >
                      {category?.name}
                    </Typography>
                    <Button size="small" onClick={() => selectAllInCategory(categoryId)} sx={{ textTransform: "none" }}>
                      Select all
                    </Button>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
                    {categoryUseCases.map((useCase) => {
                      const isLocked = useCase.available === false;
                      const isChecked = selectedUseCaseIds.includes(useCase.id);

                      if (isLocked) {
                        return (
                          <Tooltip key={useCase.id} title={UNAVAILABLE_TOOLTIP} arrow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "grey.50",
                                opacity: 0.55,
                                cursor: "not-allowed",
                              }}
                            >
                              <Checkbox size="small" checked={false} disabled tabIndex={-1} disableRipple sx={{ p: 0.5 }} />
                              <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
                                {useCase.name}
                              </Typography>
                              <LockIcon sx={{ fontSize: 15, color: "text.disabled", mr: 0.5 }} />
                            </Box>
                          </Tooltip>
                        );
                      }

                      return (
                        <Box
                          key={useCase.id}
                          onClick={() => toggleUseCase(useCase.id)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: isChecked ? "primary.main" : "divider",
                            backgroundColor: isChecked ? "rgba(25, 118, 210, 0.04)" : "white",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: isChecked ? "rgba(25, 118, 210, 0.08)" : "action.hover" },
                          }}
                        >
                          <Checkbox size="small" checked={isChecked} tabIndex={-1} disableRipple sx={{ p: 0.5 }} />
                          <Typography variant="body2">{useCase.name}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which channels notify {user?.firstName} for each selected use case.
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafc" }}>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Use case</TableCell>
                    {CHANNEL_COLUMNS.map((col) => (
                      <TableCell key={col.key} align="center" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                          <Box sx={{ color: col.color, display: "flex" }}>{col.icon}</Box>
                          {col.label}
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Notify</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedUseCaseIds.map((useCaseId) => {
                    const useCase = useCases.find((uc) => uc.id === useCaseId);
                    const channels = channelsByUseCaseId[useCaseId] ?? DEFAULT_CHANNELS;
                    const notificationMode = notificationModeByUseCaseId[useCaseId] ?? DEFAULT_NOTIFICATION_MODE;

                    return (
                      <TableRow key={useCaseId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {useCase?.name}
                          </Typography>
                          <Chip
                            label={categories.find((c) => c.id === useCase?.categoryId)?.name}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, height: 20, fontSize: "0.68rem" }}
                          />
                        </TableCell>
                        {CHANNEL_COLUMNS.map((col) => (
                          <TableCell key={col.key} align="center">
                            <Checkbox
                              size="small"
                              checked={channels[col.key]}
                              onChange={() => toggleChannel(useCaseId, col.key)}
                              sx={{ color: col.color, "&.Mui-checked": { color: col.color } }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Select
                            size="small"
                            value={notificationMode}
                            onChange={(e) => setNotificationMode(useCaseId, e.target.value as NotificationMode)}
                            sx={{ minWidth: 140, backgroundColor: "white" }}
                          >
                            {NOTIFICATION_MODE_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((s) => s - 1)} sx={{ textTransform: "none" }}>
            Back
          </Button>
        )}
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canGoNext}
            onClick={() => setActiveStep((s) => s + 1)}
            sx={{ textTransform: "none" }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={selectedUseCaseIds.length === 0 || isSaving}
            onClick={handleSave}
            sx={{ textTransform: "none" }}
          >
            {isSaving ? "Saving..." : "Save configuration"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
