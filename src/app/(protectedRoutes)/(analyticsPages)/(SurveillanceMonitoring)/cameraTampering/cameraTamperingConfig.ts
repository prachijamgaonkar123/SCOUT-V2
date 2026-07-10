import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Warning, LocationOn } from "@mui/icons-material";

export const cameraTamperingKpiConfig = {
  "Total Offline Cameras": {
    icon: VideocamOffIcon,
    tooltipMessage: "Total offline cameras",
  },
  "Total Tampered Cameras": {
    icon: Warning,
    tooltipMessage: "Total tampered cameras",
  },
  "Offline Camera Zones": {
    icon: LocationOn,
    tooltipMessage: "Zone with highest offline cameras",
  },
  "Tampered Camera Zones": {
    icon: LocationOn,
    tooltipMessage: "Zone with highest tampered cameras",
  },
};