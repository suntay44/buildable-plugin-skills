import { pricingTiers } from "@/lib/sample-content";

export function PricingTiers() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {pricingTiers.map((tier) => (
        <article
          key={tier.id}
          className={`relative grid content-start gap-4 rounded-lg border bg-white p-6 ${
            tier.highlighted ? "border-meadow shadow-md ring-2 ring-meadow/30" : "border-slate-200 shadow-sm"
          }`}
        >
          {tier.highlighted ? (
            <span className="absolute -top-3 left-6 rounded-full bg-meadow px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          ) : null}

          <div>
            <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-ink">{tier.price}</span>
              <span className="text-sm text-slate-500">/ {tier.cadence}</span>
            </p>
          </div>

          <ul className="grid gap-2 text-sm text-slate-600">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-meadow">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <a
            href="#cta"
            className={`rounded-md px-4 py-2 text-center text-sm font-semibold ${
              tier.highlighted
                ? "bg-meadow text-white hover:bg-meadow/90"
                : "border border-slate-300 text-ink hover:bg-mist"
            }`}
          >
            {tier.ctaLabel}
          </a>
        </article>
      ))}
    </div>
  );
}
