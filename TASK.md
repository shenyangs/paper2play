# A09 — Paper2Play

Build an evidence-linked 'paper formula -> interactive experiment' for ONE supported equation family. Read ./AGENTS.md. Truthful extraction and parameter sliders are more important than generic PDF-to-app claims. 110-minute MVP.

## Strict scope / libraries
- React/Vite, Express, `pdfjs-dist` for born-digital PDF text only (no OCR), `recharts` for plot, `expr-eval` only if necessary for safe whitelisted math. No JS eval or generated arbitrary executable source.
- Accept PDF <=5 MB or paste plain text. Extract page-by-page text and search for logistic growth family `P(t)=K/(1+A*exp(-r*t))` or equivalent predefined signature; provide separate bundled self-authored sample text. If equation text can't be verified, show 'unsupported equation' and allow selection of an explicitly labelled demonstration sample — NEVER fabricate a derived formula or paper citation.
- User must see extracted text snippet, page index (if PDF), detected equation family, and editable K,A,r parameters. Chart samples fixed numeric t grid and recalculates immediately. Need visible separation between 'source evidence' and the simulator.

## P0 happy path
1. Click 'Load example', see authentic fixture sample snippet and recognized logistic equation. Optional PDF upload processed if extracted text supports it.
2. Three sliders K, A, r; move r and watch real computed trajectory change. Hover chart for value.
3. 'Show source' displays the actual snippet and specific source type/page (for fixture text, show fixture, not fictitious page).
4. Unsupported input returns graceful error; no hallucinated general-paper support.

## Must prove
- Unit test exact logistic function value t=0 and monotonic growth for positive parameters; rejects unsupported formula text and too-large upload.
- E2E moves r slider, confirms chart data and readout actually changed (not only animation).
- Demo video shows an actual formula reference and sliders manipulating derived plot.
- README says logistic family only, born-digital PDF only, heuristic extraction; no universal paper implementation.

## X hook
'A research equation stopped being a screenshot. I turned it into an experiment.' Show excerpt -> live plot -> slider changes curve, with source badge.


Execute within this directory only. Run npm install, implement, then build/test/e2e/demo. Preserve real logs and status.json.

This is an authorized independent sprint execution. Start implementing now, no confirmation. Do not spawn subagents. All writes limited to this app directory; use npm install --cache .npm-cache and keep .npm-cache ignored. Existing Playwright browsers may be read from ~/Library/Caches/ms-playwright; if install required use PLAYWRIGHT_BROWSERS_PATH inside this project. Install dependencies, replace starter tests with meaningful behavior tests, run build/test/e2e/demo and preserve actual logs, screenshot and video. Do not read user credentials or other project data. Missing model keys: runnable clearly labelled fixture and PARTIAL status. Add LICENSE. Verify and finish, not merely plan.
