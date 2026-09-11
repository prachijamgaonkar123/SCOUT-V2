import type { ReactElement } from "react";
import type { AlertCategory } from "./Types";
import { CameraIcon, PersonIcon, GearIcon } from "./Icons";

/**
 * Maps each alert category to the badge glyph used in the reference design.
 * Safety and Surveillance alerts originate from camera-based detection, so both
 * use the camera glyph; Operational alerts use the system/gear glyph; Employee
 * Monitoring alerts use the person glyph. This mirrors the icons hard-coded
 * per row in the approved Option 3 mockup.
 */
export function getCategoryIcon(
  category: AlertCategory,
  className?: string,
): ReactElement {
  switch (category) {
    case "Safety":
    case "Surveillance":
      return <CameraIcon className={className} />;
    case "Operational":
      return <GearIcon className={className} />;
    case "Employee Monitoring":
      return <PersonIcon className={className} />;
    default:
      return <CameraIcon className={className} />;
  }
}
