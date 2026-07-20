// utils/hasFeature.ts

// DEV-ONLY UNLOCK: "SUC015" (Sleeping / Absence of Security Guards) is
// license-gated — real access must come from the backend adding it to the
// account's JWT `features` list. This override just lets it render unlocked
// for local dev/demo builds (NEXT_PUBLIC_USE_MOCK=true) instead of faking
// entitlements in production. Remove this once the license actually
// includes SUC015.
const DEV_UNLOCKED_FEATURES = ["SUC015"];

export const hasFeature = (
  features: string[],
  featureId?: string
): boolean => {
  if (!featureId) return true;
  if (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" &&
    DEV_UNLOCKED_FEATURES.includes(featureId)
  ) {
    return true;
  }
  return features.includes(featureId);
};
