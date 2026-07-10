// EmployeeIdelTimeKpiConfig.ts
import {  AccessTime, Groups, LocationOn, ReportProblem } from "@mui/icons-material";

export const CrowdGatheringKpiConfig = {
    "Total Incidents Detected": {
      icon: ReportProblem,
      tooltipMessage:
        "Shows the total number of crowd gathering incidents detected so far.",
         colour: "blue",
    },
    "Crowded Zone": {
      icon: Groups,
      tooltipMessage:
        "Displays the zone that currently has the highest crowd gathering.",
    },
    "Peak Crowd Density": {
      icon: LocationOn,
      tooltipMessage:
        "Shows the highest recorded crowd density along with the zone where it occurred.",
    },
     "Last Incidence": {
      icon: AccessTime,
      tooltipMessage:
        "Displays the timestamp of the most recent crowd gathering incident detected.",
    },
};




