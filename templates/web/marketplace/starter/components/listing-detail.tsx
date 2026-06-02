"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types/marketplace";

type Props = {
  listing: Listing;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
};

export function ListingDetail({ listing, saved, onToggleSave, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMessage("");
    setSubmitted(false);
    setError("");
  }, [listing.id]);

  function submitInquiry(event: React.FormEvent) {
    event.preventDefault();
    if (message.trim().length < 10) {
      setError("Add a short message (at least 10 characters) so the provider can respond.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${listing.title} details`}
      className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">{listing.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {listing.category} · {listing.location} · ★ {listing.rating.toFixed(1)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold">
            Close
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{listing.description}</p>

        <div className="mt-4 grid gap-2 rounded-lg bg-mist p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Price</span>
            <span className="font-semibold text-ink">{listing.priceLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Provider</span>
            <span className="font-medium text-ink">
              {listing.sellerName}
              {listing.verified ? <span className="ml-1 text-meadow">✓</span> : null}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Response time</span>
            <span className="font-medium text-ink">{listing.responseTime}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(listing.id)}
          className={`mt-4 w-full rounded-md border py-2 text-sm font-semibold ${saved ? "border-coral text-coral" : "border-slate-300 text-slate-700"}`}
        >
          {saved ? "♥ Saved" : "♡ Save listing"}
        </button>

        {submitted ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-meadow">
            <p className="font-semibold">Inquiry sent</p>
            <p className="mt-1 leading-6">
              {listing.sellerName} typically {listing.responseTime.toLowerCase()}. This is a local prototype, so no message actually leaves your device.
            </p>
          </div>
        ) : (
          <form onSubmit={submitInquiry} className="mt-4 grid gap-2">
            <label className="text-sm font-semibold text-ink" htmlFor="inquiry-message">
              Submit inquiry
            </label>
            <textarea
              id="inquiry-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Describe what you need and your preferred timing"
              className="rounded-md border border-slate-300 px-3 py-2 text-base"
            />
            {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
            <button type="submit" className="rounded-md bg-ocean py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Send inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
