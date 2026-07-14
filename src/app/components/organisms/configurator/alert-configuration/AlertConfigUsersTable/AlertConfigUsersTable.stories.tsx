import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertConfigUsersTable } from "./AlertConfigUsersTable";
import {
  mockUsers,
  mockUserAlertConfigs,
} from "../alertConfigMockData";
import { UserAlertConfig } from "@/app/types/alertConfig";

const configsByUserId = mockUserAlertConfigs.reduce<Record<string, UserAlertConfig>>((acc, config) => {
  acc[config.userId] = config;
  return acc;
}, {});

const meta: Meta<typeof AlertConfigUsersTable> = {
  title: "Organisms/Configurator/AlertConfiguration/AlertConfigUsersTable",
  component: AlertConfigUsersTable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    users: mockUsers,
    configsByUserId,
    onConfigure: (user) => console.log("Configure →", user.firstName),
    onToggleEnabled: (user) => console.log("Toggle enabled →", user.firstName, !user.enabled),
  },
};

export default meta;
type Story = StoryObj<typeof AlertConfigUsersTable>;

export const Default: Story = {};

export const NoneConfigured: Story = {
  args: {
    configsByUserId: {},
  },
};
