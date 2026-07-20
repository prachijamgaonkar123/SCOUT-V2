// survilanceKpiConfig.ts

import { People, Security, VideocamOff } from "@mui/icons-material";

export const surveillanceDashboardConfig = {
  "Intrusion Detection at Perimeter": {
    icon: Security,
    route: "/intrusionDetectionPage",
    tooltipMessage:
      "Shows detected intrusion incidents in monitored zones during restricted hours.",
  },
  // "Unauthorized Access in Restricted Areas": {
  //   icon: People,
  //   route: "/unauthorizedAccessInRestrictedAreas",
  //   tooltipMessage: "Displays unauthorized acess in restricted ares.",
  // },
  "Camera Tampering Detection": {
    icon: VideocamOff,
    route: "/cameraTampering",
    tooltipMessage:
      "Displays people detected inside premises during shutdown hours.",
  },
  "Movement During Shutdown Hours": {
    icon: People,
    route: "/movementDuringShutdownHours",
    tooltipMessage:
      "Displays movement detected inside premises during shutdown hours.",
  },
};
