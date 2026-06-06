# Design System Selection

Buildable gives agents a compact design system inside `appSpec.designSystem` so every generated app starts with product-specific UI direction without loading a large visual database.

## Loading Rule

- Run `buildable plan` first.
- Use `appSpec.designSystem` as the default visual direction.
- Load only the files listed in `appSpec.references`.
- Do not scan every design playbook, UI pattern, or template to choose a style.

## What The Design System Provides

`appSpec.designSystem` includes:

- `profile` and `styleName` for the selected visual archetype.
- `visualTone` for the product mood.
- `palette.intent` plus primary, accent, and status color roles.
- `typography` mood and scale.
- `density` for how compact or touch-friendly the UI should feel.
- `layoutRules` for page and screen composition.
- `componentRules` for expected controls and states.
- `motion`, `accessibility`, and `avoid` guidance.

## Agent Rules

- Treat the design system as product guidance, not a rigid theme.
- Match the starter's existing tokens and component conventions when generating from a runnable template.
- Prefer usable app screens over marketing-style composition for dashboards, CRMs, utilities, and admin tools.
- For landing pages, portfolios, and content sites, make the offer or subject visually obvious in the first viewport.
- For mobile apps, prioritize safe areas, thumb reach, readable type, and 44px minimum touch targets.
- Never rely on color alone for status. Pair color with text, icons, or labels.
- Keep palettes multi-role. Avoid a UI dominated by only one hue family.
- Add empty, loading, error, and success states when the core workflow can reach them.

## When To Ask

Ask the user before choosing a strong brand direction such as luxury, playful, dark-only, brutalist, retro, child-focused, medical, financial, or regulated-industry visual language when the prompt does not already imply it.

## When To Pair With A Dedicated Design Skill

Buildable's design system layer is intentionally compact. Use a dedicated UI/UX or brand-design skill for high-end art direction, custom illustration systems, deep typography exploration, or multiple visual concept options.
