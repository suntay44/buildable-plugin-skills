# Buildable Ecommerce Admin Template

This is the runnable golden starter for the `ecommerce-admin` archetype.

- Archetype: `ecommerce-admin`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (tabbed overview / products / orders)
- Entities: `Product`, `Order`, `OrderItem` (`types/commerce.ts`)
- Derived logic: `lib/commerce-utils.ts` (KPIs, low stock, filtering, status flow)
- Sample data: `lib/sample-data.ts`

When adapting this starter, keep data local, preserve the low-stock and empty-table states, and do not add real payments, fulfillment integrations, or a hosted store backend unless the user explicitly requests them.
