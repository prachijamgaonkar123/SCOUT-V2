import type { Meta, StoryObj } from "@storybook/react-vite";
import CameraOnlineOfflinePopUp, {
  CameraListItem,
} from "./cameraOnlineOfflinePopUp";

const meta: Meta<typeof CameraOnlineOfflinePopUp> = {
  title: "Components/Molecules/CameraOnlineOfflinePopUp",
  component: CameraOnlineOfflinePopUp,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof CameraOnlineOfflinePopUp>;

const onlineCameras: CameraListItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `CAM-${String(i + 1).padStart(3, "0")}`,
  zone: `Zone ${String.fromCharCode(65 + (i % 4))}`,
  status: "online",
}));

const offlineCameras: CameraListItem[] = [
  { id: "CAM-045", zone: "Zone B", status: "offline" },
  { id: "CAM-092", zone: "Zone C", status: "offline" },
];

const tamperedCameras: CameraListItem[] = [
  { id: "CAM-013", zone: "Zone A", status: "tampered" },
  { id: "CAM-077", zone: "Zone D", status: "tampered" },
];

export const Online: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: `Cameras Online (${onlineCameras.length})`,
    sections: [{ label: "Online", status: "online", cameras: onlineCameras }],
  },
};

export const OfflineAndTampered: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: `Cameras Offline (${offlineCameras.length + tamperedCameras.length})`,
    sections: [
      { label: "Offline", status: "offline", cameras: offlineCameras },
      { label: "Tampered", status: "tampered", cameras: tamperedCameras },
    ],
  },
};

export const Empty: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: "Cameras Offline (0)",
    sections: [
      { label: "Offline", status: "offline", cameras: [] },
      { label: "Tampered", status: "tampered", cameras: [] },
    ],
  },
};
