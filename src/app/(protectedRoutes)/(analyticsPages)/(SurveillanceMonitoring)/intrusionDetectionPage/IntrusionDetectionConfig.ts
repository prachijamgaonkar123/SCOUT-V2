import { Security, AccessTime, LocationOn } from "@mui/icons-material";

export const intrusionKpiConfig = {
  "Intrusion Detected": {
    icon: Security,
    tooltipMessage: "Total number of intrusions detected.",
  },
  "Recent Intrusion Time": {
    icon: AccessTime,
    tooltipMessage: "Time of the most recent intrusion.",
  },
  "Zone Breaches": {
    icon: LocationOn,
    tooltipMessage: "Zones where intrusions were detected.",
  },
};
