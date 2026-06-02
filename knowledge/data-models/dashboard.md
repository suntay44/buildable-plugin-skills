# SaaS Dashboard Data Model

## Entities

```ts
type Metric = {
  id: string;
  label: string;
  value: number | string;
  delta: number;
  trend: "up" | "down" | "flat";
};

type TimeSeriesPoint = {
  date: string;
  value: number;
};

type EventRow = {
  id: string;
  account: string;
  event: string;
  status: "healthy" | "warning" | "critical";
  timestamp: string;
};
```

## Derived Values

- metric deltas
- date-range filtered trend data
- status counts
- latest events

