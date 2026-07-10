import { ReportProblem, LocationOn, Schedule } from "@mui/icons-material";

export const fallDetectionKpiConfig = {
  "Total Fall Incidents": {
    icon: ReportProblem,
    tooltipMessage:
      "Total number of fall incidents detected across all monitored zones.",
  },
  "Last Detection Time": {
    icon: Schedule,
    tooltipMessage: "The time when the most recent fall incident was detected.",
  },

  "Last Detection Zone": {
    icon: LocationOn,
    tooltipMessage: "The zone where the most recent fall incident occurred.",
  },
};
