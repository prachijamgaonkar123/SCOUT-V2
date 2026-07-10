
import { Groups, LocationOn, AccessTime } from "@mui/icons-material";

  export const UnauthorizedAccessConfig = {
    "Unauthorized Access In Restricted Areas": {
      icon: Groups,
      tooltipMessage:
        "Shows the number of unauthorized access in restricted areas.",
    },
    "Zone Violations (Last 3)": {
      icon: LocationOn,
tooltipMessage:
        "Displays the count and name of restricted zones where unauthorized aeople entered .",    },
  
    "Last Incidence": {
      icon: AccessTime,
      tooltipMessage:
        "Most recent time unauthorized people were detected in restricted zones.",
    },
  };
  