import { rangeLabels } from "@/lib/dashboard-utils";
import type { RangeKey } from "@/types/dashboard";

type Props = {
  range: RangeKey;
  onChange: (range: RangeKey) => void;
};

const ranges: RangeKey[] = ["7d", "30d", "90d"];

export function RangeControl({ range, onChange }: Props) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex rounded-md border border-slate-300 bg-white p-1">
      {ranges.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={range === key}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            range === key ? "bg-ocean text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {rangeLabels[key]}
        </button>
      ))}
    </div>
  );
}
