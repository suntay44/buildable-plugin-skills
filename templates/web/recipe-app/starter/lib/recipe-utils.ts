import type { Recipe, RecipeFilters } from "@/types/recipe";

export function totalMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  const query = filters.query.trim().toLowerCase();
  return recipes
    .filter((recipe) => (filters.savedOnly ? recipe.saved : true))
    .filter((recipe) => (filters.category === "all" ? true : recipe.category === filters.category))
    .filter((recipe) => (filters.dietTag === "all" ? true : recipe.dietTags.includes(filters.dietTag)))
    .filter((recipe) =>
      query === ""
        ? true
        : recipe.name.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(query))
    );
}

export function dietTagsOf(recipes: Recipe[]): string[] {
  return [...new Set(recipes.flatMap((recipe) => recipe.dietTags))].sort();
}

export const categoryLabels: Record<Recipe["category"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  dessert: "Dessert",
  snack: "Snack"
};
