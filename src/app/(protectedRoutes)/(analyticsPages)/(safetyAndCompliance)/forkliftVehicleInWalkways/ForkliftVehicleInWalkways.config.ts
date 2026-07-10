// EmployeeIdelTimeKpiConfig.ts
import { Block, CheckCircle,  LocationOn,  } from "@mui/icons-material";

export const ForklifVehicleInWalkwaysKpiConfig = {
    "Blocked Walkways": {
      icon: Block,
      tooltipMessage:
        "Shows the total number of walkways that are currently blocked.",
      
    },
    "Clear Walkways": {
      icon: CheckCircle,
      tooltipMessage:
        "Shows the total number of walkways that are currently clear and safe for use.",
      
    },
     "Affected Zones (Last 3)": {
      icon: LocationOn,
      tooltipMessage:
        "Displays the last three zones where blocked Walkways were detected.",
       
    },
};