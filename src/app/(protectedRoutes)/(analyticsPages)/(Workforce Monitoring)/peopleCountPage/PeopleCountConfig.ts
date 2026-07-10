// EmployeeIdelTimeKpiConfig.ts
import {  Login, Logout, People } from "@mui/icons-material";

export const PeopleCountKpiConfig = {
    "People Inside": {
        icon: People,
        tooltipMessage: "Current number of people present inside the area.",
         colour: "blue",
    },
    "Entry Count": {
        icon: Login,
        tooltipMessage: "Total number of people who entered .",
         colour: "blue",
    },
    "Exit Count": {
       icon: Logout,
       tooltipMessage: "Total number of people who exited .",
        colour: "blue",
    },
};
