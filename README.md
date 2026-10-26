# CherIt

CherIt ("Share it") is a Bicol-focused teacher resource-sharing demonstration for InnoLab Hackathon 2026. Teachers find lesson packs, inspect sources and classroom requirements, download materials and share credited adaptations. "Cher mo na" is the team's proposed tagline.

**Status:** working local prototype (Vite + React + TypeScript) on branch `feat/cherit-prototype`. See [Run the demo](#run-the-demo).

## Start here

- [Partner starter prompt](START_IMPLEMENTATION.md): paste into your coding agent after updating the checkout.
- [Project memory](PROJECT_MEMORY.md): current decisions, permissions, palette and unresolved facts.
- [Implementation prompt](IMPLEMENTATION_PROMPT.md): coding-agent handoff, starting with technical preflight.
- [Execution plan](PLAN.md): priorities/checkpoints and approval boundaries.
- [Demo specification](DEMO.md): journey, disclosures and unexecuted acceptance checks.
- [Agent instructions](AGENTS.md): repository authority and workflow.
- [Research note](RESEARCH_TEACHER_RESOURCE_TOOLS.md): source-grounded context and limitations, not the implementation contract.
- [Earlier brainstorming prompt](BRAINSTORM_PROMPT.md): historical preparation aid; current decisions supersede it.

## Demonstration boundary

One local browser with functional discovery, permitted downloads, bookmarks, reviews/ratings, alias profiles and local contribution/adaptation interactions. Accounts/payment are simulated. Production security, real sales and synchronized devices are not claimed.

Teacher files are authorized for demonstration only. Store files, sanitized previews and permission records under ignored `demo-assets/`; exclude identifying metadata from tracked sample data. Preserve originals. No commit/push/public hosting/external processing of these files. Confirm modification rights and sharing of builds/submissions that embed them.

## Run the demo

Requires Node.js 22 or newer (verified on Node 25 on macOS; the Windows laptop previously reported Node 24). Everything runs locally; no accounts, API keys or internet connection are needed after install.

```sh
npm install          # once
npm run dev          # http://localhost:5173 — use this for the live demo
npm test             # rating, review, bookmark, search and folder-pack logic
npm run build        # type check + production build into dist/
npm run preview      # serve the production build at http://localhost:4173 (Windows fallback)
```

Open the app in a Chromium browser (the demo uses Dia). Press **Reset demo** in the header before each run: it clears bookmarks, reviews, downloads, uploads and moderation changes made in this browser and restores the sample data. Teacher files on disk are never changed.

`dist/` alone is not enough for the demo: folder packs and their files are served by the Vite dev/preview server. Use `npm run dev` or `npm run preview`.

## What is real and what is simulated

| Real in this prototype | Simulated or sample |
| --- | --- |
| Search and filters, file previews, file downloads, bookmarks, 1-5 ratings and their averages, uploads stored in this browser (IndexedDB), publish/hold/report state, credited adaptations, reset | Personas (no accounts or passwords), the demo moderator and curriculum-review badge, seeded reviews and counts, the supplement checkout (no payment), BOW weeks and competency codes in sample packs |

## Teacher files (demonstration only)

Teacher files never go into Git, `public/`, `src/` or `dist/`. Put them in the ignored folder, one folder per contributor alias and one subfolder per pack:

```text
demo-assets/packs/<Teacher alias>/<Grade N - Subject - [Term N Week N] - Title>/<files>
```

Example: `demo-assets/packs/Teacher A/Grade 4 - Science - Term 2 Week 3 - Water cycle/Lesson plan.docx`. The BOW part is optional. Any file type the app accepts can go in the folder.

1. Download the shared Google Drive folder into a working folder on this Mac, outside the repository.
2. Sanitize copies: `npm run sanitize -- "<downloaded folder>" "demo-assets/packs"`. Originals are untouched; the script reports what it removed.
3. Open every copy and check the content for learner and teacher names. Use aliases in folder names.
4. For each Word or PowerPoint file, export a PDF with the same name next to it (Word, Pages or Keynote on this Mac). The PDF is shown as the preview; the editable file stays the download.
5. Reload the app. Each folder appears as a pack with "Not yet reviewed", two labelled sample reviews and small sample counts.
6. Run `npm run check-assets` before any commit. It fails if teacher files are tracked or bundled.

Fictional placeholder packs in the same layout live in `sample-packs/`. Regenerate all fictional files with `npm run samples`.

## Project status

Implemented and checked in Chromium on 2026-10-26: see [DEMO.md](DEMO.md) for the exact checks and results. Work happens on `feat/cherit-prototype`; merging to `main` is planned for the 09:00 submission on 2026-10-27.

The product mentor advises on scope/judging; the coding workflow owns implementation and verification.

## Partner checkout

In an existing clone, inspect your working tree first. With no local work to reconcile, switch to main and pull with fast-forward only. If you have local changes or a different active implementation branch, preserve them and reconcile before integrating this documentation; do not reset or overwrite them.

```sh
git status --short --branch
git switch main
git pull --ff-only origin main
```

Then paste [START_IMPLEMENTATION.md](START_IMPLEMENTATION.md) into the coding agent. A separate handoff file is unnecessary: the master prompt includes partner bootstrap instructions and points to the current sources of truth.

Ignored teacher files are deliberately absent from Git. Obtain authorized local samples separately or use the explicitly fictional fallback described in the master prompt. Do not expect account connections, installed skills or assets from another person's computer.
