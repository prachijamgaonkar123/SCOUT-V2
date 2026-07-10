// ppeKpiConfig.ts
import {
  Shield,
  LocationOn,
  AccessTime,
  Construction, // ✅ replaces invalid 'Engineering'
  Checkroom,
  Visibility,
} from "@mui/icons-material";

export const ppeKpiConfig = {
  "Total Violations": {
    icon: Shield,
    tooltipMessage:
      "Total number of PPE violations detected across all monitored zones.",
  },
  "Current Unsafe Zone": {
    icon: LocationOn,
    tooltipMessage: "Number of zones where unsafe PPE compliance was detected.",
  },
  "Last Detection Time": {
    icon: AccessTime,
    tooltipMessage: "The time when the last PPE violation was detected.",
  },
  "Missing Helmet": {
    icon: Construction, // ✅ valid MUI icon for helmet/safety
    tooltipMessage:
      "Number of detected instances where workers were missing helmets.",
  },
  "Missing Vest": {
    icon: Checkroom,
    tooltipMessage:
      "Number of detected instances where workers were missing safety vests.",
  },
  "Missing Glasses": {
    icon: Visibility,
    tooltipMessage:
      "Number of detected instances where workers were missing safety glasses.",
  },
};
