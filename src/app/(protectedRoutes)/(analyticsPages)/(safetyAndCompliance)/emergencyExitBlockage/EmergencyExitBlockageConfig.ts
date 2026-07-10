// EmployeeIdelTimeKpiConfig.ts
import {  Block, CheckCircle,LocationOn } from "@mui/icons-material";

export const ExitKpiConfig = {
    "Blocked Emergency Exit": {
      icon: Block,
      tooltipMessage:
        "Shows the total number of emergency exits that are currently blocked.",
    },
    "Clear Emergency Exit Routes": {
      icon: CheckCircle,
      tooltipMessage:
       "Shows the total number of emergency exits that are currently clear and safe for use.",
    },
    "Affected Zones (Last 3)": {
      icon: LocationOn,
      tooltipMessage:
        "Displays the last three zones where blocked emergency exits were detected.",
    }
};


