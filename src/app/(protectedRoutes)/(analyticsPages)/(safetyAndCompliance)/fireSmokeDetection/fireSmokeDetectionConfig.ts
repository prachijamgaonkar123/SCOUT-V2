import {
  LocalFireDepartment,
  SmokeFree,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";

export const fireSmokeDetectionKpiConfig = {
  "Fire Incidence": {
    icon: LocalFireDepartment,
    tooltipMessage:
      "Total number of fire detections recorded across all monitored zones.",
  },
  "Smoke Incidence": {
    icon: SmokeFree,
    tooltipMessage:
      "Total number of smoke detections recorded across all monitored zones.",
  },
  "Last Detection Time": {
    icon: AccessTime,
    tooltipMessage:
      "The time when the last fire or smoke detection was recorded.",
  },
  "Last Detection Zone": {
    icon: LocationOn,
    tooltipMessage:
      "The zone where the most recent fire or smoke detection occurred.",
  },
};
