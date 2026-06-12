"use client";

import { categoryLabels, totalMinutes } from "@/lib/recipe-utils";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
};

export function RecipeCard({ recipe, selected, onSelect, onToggleSave }: Props) {
  return (
    <article
      className={`grid content-start gap-2 rounded-lg border bg-white p-4 shadow-sm ${
        selected ? "border-meadow ring-1 ring-meadow/30" : "border-slate-200"
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onSelect(recipe.id)} className="text-left font-semibold text-ink hover:underline">
          {recipe.name}
        </button>
        <button
          type="button"
          aria-pressed={recipe.saved}
          aria-label={recipe.saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
          onClick={() => onToggleSave(recipe.id)}
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            recipe.saved ? "border-meadow bg-meadow/10 text-meadow" : "border-slate-300 text-slate-500 hover:bg-mist"
          }`}
        >
          {recipe.saved ? "Saved" : "Save"}
        </button>
      </header>

      <p className="line-clamp-2 text-sm text-slate-600">{recipe.description}</p>

      <p className="text-xs font-medium text-slate-500">
        {categoryLabels[recipe.category]} · {totalMinutes(recipe)} min · Serves {recipe.servings}
      </p>

      {recipe.dietTags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {recipe.dietTags.map((tag) => (
            <li key={tag} className="rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-slate-600">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
