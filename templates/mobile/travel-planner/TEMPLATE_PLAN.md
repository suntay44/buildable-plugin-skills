# Mobile Travel Planner Template Plan

Use this planned template for local-first itinerary and saved-place prototypes.

## Product Shape

A mobile itinerary workspace that organizes trip days, places, notes, and lightweight planning status without maps or booking APIs.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `itinerary`: trip header, day tabs, planned items, saved places preview.
- `place detail`: place notes, category, day assignment, and local status.

## Interaction Checklist

- Group itinerary items by day.
- Save or unsave places.
- Add notes to a place or trip day.
- Show empty itinerary and empty saved-place states.

## Validation Hints

- Do not add maps, booking APIs, geolocation, or persistence unless requested.
- Run `buildable review` after implementation.
