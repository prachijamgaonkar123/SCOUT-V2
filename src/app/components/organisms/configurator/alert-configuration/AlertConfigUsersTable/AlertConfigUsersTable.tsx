"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
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
  Button,
  Avatar,
  Switch,
  Tooltip,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  NotificationsActiveOutlined as ConfiguredIcon,
  NotificationsOffOutlined as NotConfiguredIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { ScoutUser, UserAlertConfig, NotificationChannel } from "@/app/types/alertConfig";

interface AlertConfigUsersTableProps {
  users: ScoutUser[];
  configsByUserId: Record<string, UserAlertConfig>;
  onConfigure: (user: ScoutUser) => void;
  onToggleEnabled: (user: ScoutUser) => void;
}

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: React.ReactNode; bg: string; color: string }
> = {
  email: { label: "Email", icon: <EmailIcon sx={{ fontSize: 14 }} />, bg: "#E3F2FD", color: "#0B5FA5" },
  whatsapp: { label: "WhatsApp", icon: <WhatsAppIcon sx={{ fontSize: 14 }} />, bg: "#E4F5E9", color: "#1E7B34" },
  sms: { label: "SMS", icon: <SmsIcon sx={{ fontSize: 14 }} />, bg: "#FFF3E0", color: "#B5560A" },
};

const AVATAR_PALETTE = ["#5C6BC0", "#26A69A", "#EF6C00", "#8E24AA", "#00897B", "#546E7A", "#D81B60", "#3949AB"];

const getAvatarColor = (userId: string) => {
  const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

const getConfiguredChannels = (config: UserAlertConfig | undefined): NotificationChannel[] => {
  if (!config) return [];
  const channels = new Set<NotificationChannel>();
  config.subscriptions.forEach((sub) => {
    (Object.keys(sub.channels) as NotificationChannel[]).forEach((channel) => {
      if (sub.channels[channel]) channels.add(channel);
    });
  });
  return (["email", "whatsapp", "sms"] as NotificationChannel[]).filter((c) => channels.has(c));
};

const StatCard: React.FC<{ label: string; value: number; color: string; tint: string }> = ({
  label,
  value,
  color,
  tint,
}) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 160,
      p: 2.5,
      borderRadius: 2,
      backgroundColor: tint,
      border: "1px solid",
      borderColor: color,
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    }}
  >
    <Typography variant="h4" fontWeight={700} sx={{ color }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
  </Box>
);

export const AlertConfigUsersTable: React.FC<AlertConfigUsersTableProps> = ({
  users,
  configsByUserId,
  onConfigure,
  onToggleEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "configured" | "not_configured">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const configuredCount = useMemo(
    () => users.filter((u) => (configsByUserId[u.id]?.subscriptions.length ?? 0) > 0).length,
    [users, configsByUserId]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query);

      const userConfiguredCount = configsByUserId[user.id]?.subscriptions.length ?? 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "configured" && userConfiguredCount > 0) ||
        (statusFilter === "not_configured" && userConfiguredCount === 0);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter, configsByUserId]);

  const pagedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Stats Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard label="Total Users" value={users.length} color="#1976D2" tint="rgba(25, 118, 210, 0.06)" />
        <StatCard label="Configured" value={configuredCount} color="#2E7D32" tint="rgba(46, 125, 50, 0.06)" />
        <StatCard label="Not Configured" value={users.length - configuredCount} color="#ED6C02" tint="rgba(237, 108, 2, 0.06)" />
      </Box>

      {/* Search & Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, minWidth: 240, "& .MuiOutlinedInput-root": { backgroundColor: "white" } }}
        />
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(0);
          }}
          sx={{ minWidth: 190, backgroundColor: "white" }}
        >
          <MenuItem value="all">All statuses</MenuItem>
          <MenuItem value="configured">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ConfiguredIcon fontSize="small" color="success" /> Configured
            </Box>
          </MenuItem>
          <MenuItem value="not_configured">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotConfiguredIcon fontSize="small" color="disabled" /> Not configured
            </Box>
          </MenuItem>
        </Select>
      </Box>

      {filteredUsers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No users match your search or filters.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f9fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>User Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  Configured Use Cases
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Notification Channels</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Last Updated</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedUsers.map((user) => {
                const config = configsByUserId[user.id];
                const userConfiguredCount = config?.subscriptions.length ?? 0;
                const configuredChannels = getConfiguredChannels(config);
                const isConfigured = userConfiguredCount > 0;

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      opacity: user.enabled ? 1 : 0.55,
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            bgcolor: getAvatarColor(user.id),
                          }}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            {!user.enabled && (
                              <Chip
                                label="Disabled"
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, backgroundColor: "rgba(0,0,0,0.08)" }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={userConfiguredCount}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          minWidth: 32,
                          backgroundColor: isConfigured ? "rgba(46, 125, 50, 0.1)" : "rgba(0, 0, 0, 0.06)",
                          color: isConfigured ? "success.dark" : "text.secondary",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {configuredChannels.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      ) : (
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {configuredChannels.map((channel) => (
                            <Chip
                              key={channel}
                              icon={CHANNEL_META[channel].icon as React.ReactElement}
                              label={CHANNEL_META[channel].label}
                              size="small"
                              sx={{
                                backgroundColor: CHANNEL_META[channel].bg,
                                color: CHANNEL_META[channel].color,
                                fontWeight: 600,
                                "& .MuiChip-icon": { color: CHANNEL_META[channel].color },
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {config?.updatedAt ? dayjs(config.updatedAt).format("MMM D, YYYY") : "Never"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          user.enabled
                            ? "Enabled — this user receives alert notifications"
                            : "Disabled — this user will not receive any alert notifications"
                        }
                      >
                        <Switch
                          size="small"
                          checked={user.enabled}
                          onChange={() => onToggleEnabled(user)}
                          color="success"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant={isConfigured ? "outlined" : "contained"}
                        size="small"
                        startIcon={<SettingsIcon fontSize="small" />}
                        endIcon={<ChevronRightIcon fontSize="small" />}
                        onClick={() => onConfigure(user)}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        {isConfigured ? "Edit" : "Configure"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredUsers.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};
