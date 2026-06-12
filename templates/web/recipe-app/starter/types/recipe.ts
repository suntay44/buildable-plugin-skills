export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "dessert" | "snack";

export type Ingredient = {
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  dietTags: string[];
  saved: boolean;
};

export type RecipeFilters = {
  query: string;
  category: "all" | RecipeCategory;
  dietTag: string;
  savedOnly: boolean;
};
