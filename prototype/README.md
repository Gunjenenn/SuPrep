# SuuPrep — interactive prototype

AI-powered, gamified SAT Math platform for Mongolian students, with **Суу** the black-cat tutor and a Desmos-style graphing academy.

## Run / build
```
node scripts/build.mjs        # → dist/index.html (single self-contained page) + dist/test.html
node scripts/e2e.mjs <outdir>  # Playwright walkthrough of the 18-step demo (screenshots)
```
Built with React 19 + TypeScript (esbuild), Tailwind CSS v4 (compile API), KaTeX (fonts inlined), react-icons/lu (Lucide set). Only Google Fonts load from the network.

## Structure
- `src/brand` — Суу cat (head, sitting, peeking, sleeping, 7 moods), blob/stars/scribble ornaments, logo.
- `src/lib/expr.ts` — expression parser (implicit multiplication, powers, functions, relations, TeX output).
- `src/lib/graph.ts` — rows → plottable objects, POIs (roots, intercepts, extrema, intersections), equivalence checks.
- `src/components/GraphCalc.tsx` — Desmos-style calculator: expression list, sliders, tables + linear regression, inequalities, implicit curves, pan/zoom/pinch, clickable POIs.
- `src/data` — curriculum (5 stages, lessons, checkpoints with two variant sets), Desmos lessons (validated steps), SAT question bank, badges, quests, vocabulary.
- `src/lib/store.tsx` — demo state (XP, levels, streak, quests, badges, mistakes, mastery), persisted in localStorage.
- `src/services/tutor.ts` — `TutorService` interface; `DemoTutorService` (labelled demo replies) and `GeminiTutorService` (calls a backend).
- `server/gemini-proxy.mjs` — example backend that holds `GEMINI_API_KEY` and calls Gemini. Set `window.SUUPREP_TUTOR_ENDPOINT` to switch the UI to live mode.

## Notes
- The calculator is SuuPrep's own Desmos-style simulation, not the official Desmos API (needs a Desmos partner API key/licence). The lesson runner only depends on `onState / onPoi / onView` events, so it can be re-pointed at the official API later.
- Mock-exam scaled score is an approximation for demo purposes, not the College Board conversion.
