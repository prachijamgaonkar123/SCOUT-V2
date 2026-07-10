// EmployeeIdelTimeKpiConfig.ts
import { AccessTime, Room } from "@mui/icons-material";
import WorkIcon from "@mui/icons-material/Work";
import WorkOffIcon from "@mui/icons-material/WorkOff";

export const EmployeeIdelTimeKpiConfig = {
  "Total Idle Time": {
    icon: AccessTime,
    tooltipMessage: "Total idle time detected by the system.",
  },
  "Last Idle Detection Time": {
    icon: AccessTime,
    tooltipMessage: "The most recent idle detection timestamp.",
  },
  "Last Idle Detection Zone": {
    icon: Room,
    tooltipMessage: "The zone where the most recent idle event was detected.",
  },
  "Total Working Time": {
    icon: WorkIcon,
    tooltipMessage: "Total working time detected by the system.",
  },
  "Total Not Working Time": {
    icon: WorkOffIcon,
    tooltipMessage: "Total non-working time detected by the system.",
  },
};
