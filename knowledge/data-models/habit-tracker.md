# Habit Tracker Data Model

## Entities

```ts
type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "weekdays" | "custom";
  targetDays: string[];
  color: string;
  createdAt: string;
};

type CheckIn = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};
```

## Derived Values

- today's habits
- completion percentage
- current streak
- weekly completion grid

