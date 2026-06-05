# Buildable Preview

Render the running prototype in a headless browser, screenshot it, and catch runtime/visual errors.

Start the dev server (e.g. `npm run dev`), then run:

```bash
buildable preview --url http://localhost:3000 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" preview --url http://localhost:3000
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Needs Playwright (`npm i -D playwright && npx playwright install chromium`); if it reports skipped, install it or use your own screenshot tool. Open `.buildable/preview.png` and `.buildable/preview-report.md`, confirm the first screen looks intentional (visible actions, real data, good empty states, no blank render), fix what the screenshot reveals, and re-run until it passes.
