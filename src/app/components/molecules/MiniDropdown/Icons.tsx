import type { FC, SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  strokeWidth?: number;
}

function baseProps(props: IconProps): SVGProps<SVGSVGElement> {
  const { strokeWidth, ...rest } = props;
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth ?? 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...rest,
  };
}

export const CameraIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <rect x="1" y="5" width="15" height="14" rx="2" />
    <path d="M23 7 16 12l7 5V7Z" />
  </svg>
);

export const PersonIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const GearIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
  </svg>
);

export const PinIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ClockIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const ChevronDownIcon: FC<IconProps> = (props) => (
  <svg {...baseProps(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
