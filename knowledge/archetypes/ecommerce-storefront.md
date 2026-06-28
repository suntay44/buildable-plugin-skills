# Ecommerce Storefront Archetype

Build a local-first shopping storefront prototype for browsing products, comparing details, and managing cart state with mock data.

## Core Shape

- Catalog screen with search, category filters, product cards, and results count.
- Product detail screen with image placeholder, price, variants/options, stock/status copy, and add-to-cart action.
- Cart screen with quantities, subtotal, empty-cart state, and a checkout handoff placeholder.

## Local-First Rules

- Use local product and cart seed data.
- Do not add payment processing, inventory sync, shipping APIs, accounts, or checkout providers unless explicitly requested.
- If checkout is requested, keep it as a local/mock handoff or ask which provider the user wants.

