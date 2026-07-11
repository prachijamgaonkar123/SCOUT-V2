import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import AlertStatsCard from "./AlertStatsCard";

const meta: Meta<typeof AlertStatsCard> = {
  title: "Components/Molecules/AlertStatsCard",
  component: AlertStatsCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**SCOUT Alert Statistics Card**

Self-contained grid of alert statistics (Critical, Non-Critical, Acknowledged, Resolved) used at the top of the System Alerts page. Takes no props - the stat values are defined internally.
        `,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Box
        sx={{
          backgroundColor: "#f5f7fa",
          p: 3,
          borderRadius: 1,
          width: "100%",
          minWidth: "900px",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Alert statistics grid as it appears in the SCOUT Alerts page.",
      },
    },
  },
};
