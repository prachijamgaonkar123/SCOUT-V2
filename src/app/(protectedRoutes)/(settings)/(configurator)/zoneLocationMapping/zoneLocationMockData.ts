import { GetZonesResponse } from "./ZoneLocationMappingApi";

export const mockZonesResponse: GetZonesResponse = {
  stats: {
    totalZones: 4,
    configuredZones: 3,
    totalLocationAssignments: 9,
    camerasCount: 12,
  },
  zones: [
    {
      id: "zone-1",
      zoneName: "Manufacturing Floor",
      description: "Primary production and assembly area",
      locationsCount: 4,
      camerasCount: 6,
      locations: [
        { id: "loc-1", zoneId: "zone-1", locationName: "Assembly Line 1", description: "" },
        { id: "loc-2", zoneId: "zone-1", locationName: "Assembly Line 2", description: "" },
        { id: "loc-3", zoneId: "zone-1", locationName: "Quality Check Bay", description: "" },
        { id: "loc-4", zoneId: "zone-1", locationName: "Packaging Area", description: "" },
      ],
    },
    {
      id: "zone-2",
      zoneName: "Warehouse",
      description: "Storage and loading dock area",
      locationsCount: 3,
      camerasCount: 4,
      locations: [
        { id: "loc-5", zoneId: "zone-2", locationName: "Loading Dock", description: "" },
        { id: "loc-6", zoneId: "zone-2", locationName: "Storage Rack A", description: "" },
        { id: "loc-7", zoneId: "zone-2", locationName: "Storage Rack B", description: "" },
      ],
    },
    {
      id: "zone-3",
      zoneName: "Perimeter",
      description: "Outdoor boundary and gate monitoring",
      locationsCount: 2,
      camerasCount: 2,
      locations: [
        { id: "loc-8", zoneId: "zone-3", locationName: "Main Gate", description: "" },
        { id: "loc-9", zoneId: "zone-3", locationName: "Rear Gate", description: "" },
      ],
    },
    {
      id: "zone-4",
      zoneName: "Office Block",
      description: "Administrative and office spaces",
      locationsCount: 0,
      camerasCount: 0,
      locations: [],
    },
  ],
};
