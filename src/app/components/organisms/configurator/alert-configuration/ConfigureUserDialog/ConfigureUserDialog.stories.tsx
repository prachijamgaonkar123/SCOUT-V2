import type { Meta, StoryObj } from "@storybook/nextjs";
import { ConfigureUserDialog } from "./ConfigureUserDialog";
import {
  mockUsers,
  mockCategories,
  mockUseCases,
  mockUserAlertConfigs,
} from "../alertConfigMockData";

const meta: Meta<typeof ConfigureUserDialog> = {
  title: "Organisms/Configurator/AlertConfiguration/ConfigureUserDialog",
  component: ConfigureUserDialog,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: () => console.log("Dialog closed"),
    onSave: (config) => console.log("Saved →", config),
    categories: mockCategories,
    useCases: mockUseCases,
    user: mockUsers[4],
    existingConfig: null,
  },
};

export default meta;
type Story = StoryObj<typeof ConfigureUserDialog>;

export const NewUser: Story = {};

export const EditingExistingUser: Story = {
  args: {
    user: mockUsers[2],
    existingConfig: mockUserAlertConfigs.find((c) => c.userId === "user-3") ?? null,
  },
};

export const WithUnavailableUseCases: Story = {
  args: {
    useCases: mockUseCases.map((uc, index) =>
      index % 3 === 2 ? { ...uc, available: false } : { ...uc, available: true }
    ),
  },
};
