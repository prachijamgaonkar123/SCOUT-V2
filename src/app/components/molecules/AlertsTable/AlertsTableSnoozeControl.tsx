"use client";

import { Box, Switch, Tooltip, Typography } from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { DASHBOARD_COLORS } from "@/app/config/dashboardTheme";
import { useAlerts } from "@/Providers/AlertsProvider";

const COLORS = DASHBOARD_COLORS;

export default function AlertsTableSnoozeControl() {
  const { isPopupSnoozed, clearSnooze } = useAlerts();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /*
     * This switch can only ever turn snooze OFF.
     * It's turned ON automatically, the moment a snooze duration is
     * picked from the alert popup — never by clicking here. Since
     * `checked` below is fully driven by `isPopupSnoozed`, an attempt
     * to check it (turn it on) is simply ignored.
     */
    if (!event.target.checked) {
      clearSnooze();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Switch
        size="small"
        checked={isPopupSnoozed}
        onChange={handleChange}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: COLORS.error },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: COLORS.error,
          },
        }}
      />

      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 600,
          color: isPopupSnoozed ? COLORS.error : COLORS.textSecondary,
          whiteSpace: "nowrap",
        }}
      >
        {isPopupSnoozed ? "Snoozed" : "Not snoozed"}
      </Typography>

      <Tooltip
        arrow
        placement="top"
        title={
          isPopupSnoozed
            ? "The alert popup is currently snoozed. Turn this off to stop snoozing and bring the popup back with the latest alerts."
            : "The popup can be snoozed from within the popup itself (5 / 15 / 30 min). Once snoozed, you can turn it off here."
        }
      >
        <InfoOutlineIcon
          sx={{ fontSize: 15, color: COLORS.textSecondary, cursor: "default" }}
        />
      </Tooltip>
    </Box>
  );
}
