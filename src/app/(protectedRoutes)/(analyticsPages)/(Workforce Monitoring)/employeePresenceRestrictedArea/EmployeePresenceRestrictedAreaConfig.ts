// EmployeeIdelTimeKpiConfig.ts
import { AccessTime, Room } from "@mui/icons-material";

export const EmployeePresenceRestrictedAreaKpiConfig = {
  "Employee Absence Events": {
    icon: AccessTime,
    tooltipMessage: "No. of times no employee detected in restricted areas..",
  },
  "Zone Violations (Last 3)": {
    icon: Room,
    tooltipMessage: "The zones where the most employee presence event was detected.",
  },
    "Last Detection Time": {
    icon: AccessTime,
    tooltipMessage: "The most recent idle detection timestamp.",
  },
};
