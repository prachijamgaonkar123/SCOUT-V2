import { AccessTime, Groups, LocationOn, ReportProblem } from "@mui/icons-material";

export const ZoneOccupancyMonitoringKpiConfig = {
  "Total Occupancy Violations": {
    icon: ReportProblem,
    tooltipMessage:
      "Shows the total number of zone occupancy violations detected so far.",
    colour: "blue",
  },
  "Most Congested Zone": {
    icon: Groups,
    tooltipMessage:
      "Displays the zone that currently has the highest occupancy.",
  },
  "Peak Occupancy Count": {
    icon: LocationOn,
    tooltipMessage:
      "Shows the highest recorded occupancy count along with the zone where it occurred.",
  },
  "Last Incidence": {
    icon: AccessTime,
    tooltipMessage:
      "Displays the timestamp of the most recent zone occupancy violation detected.",
  },
};
