# Paper2Play

> A research equation stopped being a screenshot. I turned it into an experiment.

A local, evidence-linked playground for **one logistic-growth equation family**. React + Vite renders a Recharts curve; Express extracts source text with PDF.js and checks a predefined formula signature. No LLM is called. The UI explicitly labels its heuristic engine and self-authored fixtures.

## Run

Requires Node.js 22.13+ and npm. From this repository:

```sh
npm install --cache .npm-cache
npm run dev
```

Open http://127.0.0.1:4209. API: http://127.0.0.1:5209/api/health. Both servers bind only to 127.0.0.1. No parent workspace files or API keys are needed. `.env.example` documents this; there is no model-provider integration.

## Three-step demonstration

1. Click **Load example**. A separate, self-authored fixture is fetched from the API and recognized as logistic growth.
2. Move **r** from 0.30 to 0.60. The 101-point curve recomputes immediately; P(10) changes from 69.057 to 97.818. Hover to inspect values. K and A are also editable.
3. Click **Show source**. Inspect the actual fixture snippet and its FIXTURE badge, with no invented paper or page citation.

Alternatively paste text containing `P(t)=K/(1+A*exp(-r*t))`, then click **Analyze text**. Upload `fixtures/logistic.pdf` for a real born-digital PDF extraction: the matching formula is on page 2. Unsupported text displays an error and disables the simulator.

## Validation and evidence

```sh
npm run browsers:install
npm run build
npm run test
npm run e2e
npm run demo
```

The browser installer uses a repository-local `.browsers/` directory, excluded from Git. Playwright honors an explicitly supplied `PLAYWRIGHT_BROWSERS_PATH` if desired. To reuse an existing browser, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable and install the matching video encoder with `PLAYWRIGHT_BROWSERS_PATH=.browsers npx playwright install ffmpeg`. Tests launch the local app automatically; keep ports 4209 and 5209 free.

- Unit assertions cover the exact initial value, monotonic bounded growth, invalid parameters, source/page preservation, unsupported formulas, and PDF size boundaries.
- Browser assertions verify API-to-UI extraction, actual numerical chart data and readout changes, unsupported input, real PDF page 2, malformed uploads, and the backend's 5 MB rejection.
- The demo manipulates r and K and verifies their numerical results. Genuine videos and screenshots are generated under `artifacts/playwright/e2e/` and `artifacts/playwright/demo/`; `artifacts/demo.png` and `artifacts/curve-evidence.png` provide stills.
- Actual command logs and final outcomes are recorded locally under `artifacts/logs/` and summarized in `status.json`. Evidence is intentionally not committed.
- Initial validation found an obsolete PDF.js TypeScript option, which was removed. The first browser run failed because the matching Playwright browser was absent; the passing runs use an existing cached Chromium through `PLAYWRIGHT_EXECUTABLE_PATH`, plus a matching FFmpeg installed locally. Two slow Chromium downloads were stopped; fresh browser-download completion remains unverified. No assertion was weakened to bypass either failure.

## Honest scope and safety

**PARTIAL as an AI MVP:** the runnable deterministic slice is implemented, but no model inference is integrated or verified. This is not a universal paper-to-app converter.

Only the explicit signature above is recognized (case/whitespace normalization and Unicode minus are accepted). Algebraically equivalent notation, LaTeX layout, scanned PDFs, and OCR are unsupported. Recognition verifies a text signature, not the scientific validity of the paper. K=100, A=9, r=0.3 are illustrative defaults, never extracted estimates. Units are generic.

PDF uploads are capped at 5 MB and 40 pages, with a 15-second extraction timeout and one active extraction at a time. Text input is capped at 50,000 characters (100 KB HTTP body). Uploads stay in process memory, are not saved, and are not sent to remote services. There is no arbitrary local-file reader, URL fetcher, generated code, or JavaScript evaluation. Keep this unauthenticated development service local; it is not hardened for public deployment. Large or unusual PDFs may still use substantial memory before the page cap is checked.

The production build currently emits a non-fatal chunk-size warning from Recharts. Cross-browser behavior, arbitrary third-party PDFs, and accessibility audits are unverified.

MIT licensed. Both bundled examples are self-authored and are not published research.
