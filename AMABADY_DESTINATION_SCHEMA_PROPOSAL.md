# Destination Schema Proposal

## 1. The `spots` Collection
A new collection to store the Master Destination data.

```typescript
type DestinationSpot = {
  id: string; // Internal DISC-XXXXX
  canonicalName: string;
  aliases: string[];
  topCategory: "PILGRIMAGE" | "TOURIST";
  subcategory: string;
  geography: {
    region: string;
    stateUT: string;
    district: string;
    cityLocality: string;
  };
  verification: {
    discoveryStatus: "DISCOVERED" | "VERIFIED" | "ARCHIVED";
    adminStatus: "PENDING" | "APPROVED" | "REJECTED";
  };
  source: string;
  importance: "MAJOR" | "LOCAL" | "UNRANKED";
  metadata?: {
    lat?: number;
    lng?: number;
  }
}
```

## 2. Updated `tours` Collection
Modify the current tour model to reference spots.

```typescript
type Tour = {
  // ... current fields
  primarySpotId: string; // Reference to DISC-XXXXX
  additionalSpotIds: string[]; // For multi-destination tours
}
```
