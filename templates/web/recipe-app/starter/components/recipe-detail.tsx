"use client";

import { categoryLabels, totalMinutes } from "@/lib/recipe-utils";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe | null;
  onToggleSave: (id: string) => void;
};

export function RecipeDetail({ recipe, onToggleSave }: Props) {
  if (!recipe) {
    return (
      <section aria-label="Recipe detail" className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-12">
        <p className="max-w-xs text-center text-sm text-slate-500">Select a recipe card to see ingredients and steps.</p>
      </section>
    );
  }

  return (
    <section aria-label="Recipe detail" className="grid content-start gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">{recipe.name}</h2>
          <button
            type="button"
            aria-pressed={recipe.saved}
            onClick={() => onToggleSave(recipe.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${
              recipe.saved ? "bg-meadow/10 text-meadow" : "bg-meadow text-white hover:bg-meadow/90"
            }`}
          >
            {recipe.saved ? "Saved ✓" : "Save recipe"}
          </button>
        </div>
        <p className="text-sm text-slate-600">{recipe.description}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {categoryLabels[recipe.category]} · Prep {recipe.prepMinutes} min · Cook {recipe.cookMinutes} min · Total{" "}
          {totalMinutes(recipe)} min · Serves {recipe.servings}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ingredients</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.name} className="flex justify-between gap-3 rounded-md bg-[#f7f8fb] px-3 py-2">
                <span className="text-ink">{ingredient.name}</span>
                <span className="shrink-0 text-slate-500">{ingredient.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Steps</h3>
          <ol className="mt-3 grid gap-3">
            {recipe.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
