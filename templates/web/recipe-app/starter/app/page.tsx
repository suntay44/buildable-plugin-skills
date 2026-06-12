"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeDetail } from "@/components/recipe-detail";
import { categoryLabels, dietTagsOf, filterRecipes } from "@/lib/recipe-utils";
import { sampleRecipes } from "@/lib/sample-recipes";
import type { Recipe, RecipeFilters } from "@/types/recipe";

const emptyFilters: RecipeFilters = { query: "", category: "all", dietTag: "all", savedOnly: false };

export default function RecipeApp() {
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
  const [filters, setFilters] = useState<RecipeFilters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(sampleRecipes[0]?.id ?? null);

  const visible = filterRecipes(recipes, filters);
  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const dietTags = dietTagsOf(recipes);
  const savedCount = recipes.filter((recipe) => recipe.saved).length;

  const toggleSave = (id: string) =>
    setRecipes((current) => current.map((recipe) => (recipe.id === id ? { ...recipe, saved: !recipe.saved } : recipe)));

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Larder</h1>
            <p className="text-sm text-slate-500">Browse recipe cards, filter by diet, and save what you want to cook.</p>
          </div>
          <button
            type="button"
            aria-pressed={filters.savedOnly}
            onClick={() => setFilters((current) => ({ ...current, savedOnly: !current.savedOnly }))}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              filters.savedOnly ? "bg-ink text-white" : "border border-slate-300 text-ink hover:bg-mist"
            }`}
          >
            Saved recipes ({savedCount})
          </button>
        </header>

        <section aria-label="Recipe filters" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Ingredient search
              <input
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                placeholder="Search recipes or ingredients (e.g. chickpeas)"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Category filter
              <select
                value={filters.category}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value as RecipeFilters["category"] }))}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              >
                <option value="all">All categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Diet filter
              <select
                value={filters.dietTag}
                onChange={(event) => setFilters((current) => ({ ...current, dietTag: event.target.value }))}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              >
                <option value="all">All diets</option>
                {dietTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-sm text-slate-500">
            {visible.length} recipe{visible.length === 1 ? "" : "s"} shown
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          {visible.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              {filters.savedOnly && savedCount === 0
                ? "No saved recipes yet. Save a recipe to build your cooking list."
                : "No recipes match these filters. Clear the search or filters to see the full collection."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {visible.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  selected={selectedId === recipe.id}
                  onSelect={setSelectedId}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}

          <RecipeDetail recipe={selected} onToggleSave={toggleSave} />
        </div>
      </div>
    </main>
  );
}
