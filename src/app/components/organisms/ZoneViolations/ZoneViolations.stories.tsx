import type { Meta, StoryObj } from "@storybook/react-vite"; 
import ZoneViolations, { ZoneViolationsdata } from "./ZoneViolation";

import AlarmIcon from "@mui/icons-material/Alarm";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// 👇 Default export with metadata
const meta: Meta<typeof ZoneViolations> = {
  title: "Components/Organisms/ZoneViolations",
  component: ZoneViolations,
  tags: ["autodocs"],
  argTypes: {
    maxHeight: { control: "number" },
    tooltipMessage: { control: "text" },
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ZoneViolations>;

// Example mock data
const mockData: ZoneViolationsdata[] = [
  {
    zone: "Zone A",
    violations: 12,
    alarms: 4,
    icons: {
      violations: ReportProblemIcon,
      alarms: AlarmIcon,
    },
  },
  {
    zone: "Zone B",
    violations: 5,
    alarms: 1,
    icons: {
      violations: ReportProblemIcon,
      alarms: AlarmIcon,
    },
  },
  {
    zone: "Zone C",
    violations: 8,
    alarms: 2,
    icons: {
      violations: ReportProblemIcon,
      alarms: AlarmIcon,
    },
  },
];

// 👇 Default story
export const Default: Story = {
  args: {
    violationsZone: mockData,
    loading: false,
  },
};

// 👇 Loading state
export const Loading: Story = {
  args: {
    violationsZone: [], // <-- changed here
    loading: true,
  },
};

// 👇 With tooltip
export const WithTooltip: Story = {
  args: {
    violationsZone: [
      // <-- changed here
      { zone: "Zone A", violations: 5, alarms: 2 },
      { zone: "Zone B", violations: 3, alarms: 0 },
      { zone: "Zone C", violations: 8, alarms: 4 },
      { zone: "Zone D", violations: 0, alarms: 1 },
    ],
    loading: false,
    tooltipMessage:
      "This section shows the number of violations and alarms detected per zone.",
  },
};
