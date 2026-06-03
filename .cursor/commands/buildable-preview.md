# Buildable Preview

Render the running prototype in a headless browser, screenshot it, and catch runtime/visual errors.

Start the dev server (e.g. `npm run dev`), then run:

```bash
node ./bin/buildable.mjs preview ./path-to-app --url http://localhost:3000
```

Needs Playwright (`npm i -D playwright && npx playwright install chromium`); if it reports skipped, install it or use your own screenshot tool. Open `.buildable/preview.png` and `.buildable/preview-report.md`, confirm the first screen looks intentional (visible actions, real data, good empty states, no blank render), fix what the screenshot reveals, and re-run until it passes.
