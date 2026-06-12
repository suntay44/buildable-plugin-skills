# Recipe App Data Model

## Entities

```ts
type Recipe = {
  id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "dessert" | "snack";
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  dietTags: string[]; // "vegetarian" | "vegan" | "gluten-free" | ...
  saved: boolean;
  createdAt: string;
  updatedAt: string;
};

type Ingredient = {
  name: string;
  quantity: string; // "2 cups", "1 tbsp"
};
```

## Derived Values

- recipes filtered by category, diet tag, or ingredient search
- total time (`prepMinutes + cookMinutes`)
- saved recipes collection
- distinct diet tags for filter chips

## Notes

- Seed 8-10 realistic recipes across categories with at least two diet-tagged ones.
- Ingredient search matches against `ingredients[].name`, not just the title.
- `saved` is a local toggle; no accounts or sync unless requested.
