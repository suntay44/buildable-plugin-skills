---
description: Render the running prototype in a headless browser, screenshot it, and catch runtime/visual errors.
argument-hint: [path-to-app] [--url <url>]
allowed-tools: Bash(node:*), Bash(buildable:*), Bash(npm:*), Read, Edit
---

Visually verify the prototype at: **${ARGUMENTS:-.}**

1. Start the app's dev server if it isn't already running (e.g. `npm run dev`), and note the local URL (default `http://localhost:3000`).

2. Render and capture it:

   ```bash
   buildable preview "${ARGUMENTS:-.}" --url http://localhost:3000 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" preview "${ARGUMENTS:-.}" --url http://localhost:3000
   ```

   - This needs Playwright. If preview reports it is skipped, install it once: `npm i -D playwright && npx playwright install chromium`. If you have your own preview/screenshot tool, use that instead.

3. Open the screenshot at `.buildable/preview.png` and read `.buildable/preview-report.md`. Confirm the first screen looks intentional: visible primary actions, real sample data, non-generic empty states, no overlap, no blank render.

4. Fix anything the screenshot or runtime errors reveal (things `tsc`/`build` cannot catch), then re-run preview until it passes.
