import type { Meta, StoryObj } from "@storybook/react-vite";
import Sidebar from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Organisms/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "SCOUT Navigation Sidebar with collapsible analytics categories, dashboard navigation, and Elansol Technologies branding. Provides access to all analytics pages and system features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    alertCount: {
      control: "number",
      description: "Live alert count from the alerts API / socket.",
    },
    onCollapsedChange: {
      action: "collapsed-changed",
      description: "Fired whenever the collapsed/rail state changes.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alertCount: 3,
    onCollapsedChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Default sidebar with an active alert badge.",
      },
    },
  },
};
