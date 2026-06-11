# Content & Marketing Surface Rubric

Use for landing pages, portfolios, blogs/CMS, documentation, newsletters, and hospitality/service sites — surfaces whose job is to communicate and convert. Score each category 0 to 3. Pairs with `knowledge/quality-rubrics/web-app.md` (base) and the registry `foundations`.

## Categories

- `Message Clarity`: the offer, product, or purpose is obvious in the first viewport without scrolling.
- `Conversion Path`: a primary call to action is visible, repeated where useful, and unmistakable.
- `Visual Hierarchy`: one expressive heading scale, restrained section headings, generous whitespace — built from the `typeScale` and `spacingScale`, not ad-hoc sizes.
- `Content Realism`: concrete copy, real-looking product shots or content placeholders — never lorem ipsum or empty hero shells.
- `Section Rhythm`: full-width sections with consistent vertical spacing; avoid nested card-in-card shells.
- `Responsiveness`: navigation collapses cleanly, hero reflows, and no horizontal overflow on mobile.
- `Token Discipline`: one brand accent driven from a named token; no scattered raw hex. `buildable review` warns (`design-tokens`) on palette bypass.
- `Accessibility`: semantic heading order, descriptive link text, sufficient contrast on text over media.
- `Local-First`: no analytics, no email-capture backends, no hosted forms unless explicitly requested.

## Passing Bar

Average at least 2.5 with no score below 2. `Message Clarity` and `Conversion Path` must each be at least 2.

## Automatic Failures

- first viewport is an abstract gradient or empty hero with no stated value
- call to action is missing, hidden, or ambiguous
- placeholder/lorem copy in shipped sections
- nested decorative cards with no content hierarchy
- wires up a hosted form, mailing list, or analytics tag that was not requested
