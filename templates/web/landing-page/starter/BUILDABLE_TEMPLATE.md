# Buildable Landing Page Template

This is the runnable golden starter for the `landing-page` archetype.

- Archetype: `landing-page`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local content data
- Primary screen: `app/page.tsx` (single scroll: hero → features → social proof → pricing → FAQ → CTA → footer)
- Entities: `Section`, `Feature`, `Testimonial`, `PricingTier`, `Faq` (`types/content.ts`)
- Copy as data: `lib/sample-content.ts`
- Responsive nav with mobile disclosure menu: `components/site-nav.tsx`

When adapting this starter, swap the sample copy for the user's product, keep exactly one highlighted pricing tier, keep the primary CTA repeated in hero and closing sections, and do not add checkout, billing, analytics, email-capture backends, or hosting integrations unless the user explicitly requests them.
