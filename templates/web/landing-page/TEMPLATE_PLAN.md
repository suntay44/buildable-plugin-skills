# Landing Page Template Plan

Runnable golden starter for the `landing-page` archetype: a single-scroll marketing site for a SaaS product with hero, features, social proof, pricing, FAQ, and closing CTA.

## Structure

- `app/page.tsx` — section composition in order: nav → hero → features → social proof → pricing → FAQ → closing CTA → footer
- `components/site-nav.tsx` — responsive nav (inline links desktop, disclosure menu mobile), anchor links
- `components/pricing-tiers.tsx` — three tiers, one highlighted, display-only pricing
- `lib/sample-content.ts` — all copy as data (sections, features, testimonials, tiers, FAQs)
- `types/content.ts` — `Section`, `Feature`, `Testimonial`, `PricingTier`, `Faq`

## Acceptance Checklist

- the offer is obvious in the first viewport with a primary CTA
- features are concrete benefits, not adjectives
- exactly one pricing tier is highlighted
- nav collapses to an accessible disclosure menu on mobile
- no horizontal overflow at 360px
- copy is real product copy, no lorem ipsum

## Non-Goals

- no checkout/billing, analytics, email capture backend, or hosting integration
- no CMS; copy lives in `lib/sample-content.ts`
