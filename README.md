# CherIt

CherIt ("Share it") is a lesson-pack library for Bicol public-school teachers, built for InnoLab Hackathon 2026. Teachers find lesson packs that match their curriculum and classroom, check who made them and how other teachers rated them, download and adapt them, and share their own. "Cher mo na" is the team's tagline.

**Status:** working local prototype. Everything runs in one browser on one machine, with no server, accounts or API keys.

## Requirements

| Requirement | Version / notes |
| --- | --- |
| Node.js | 22.12 or newer (Vite 8 also accepts 20.19+). Used on Node 25 (macOS) and Node 24 (Windows). |
| npm | Comes with Node.js. No other package manager is needed. |
| Browser | A current Chromium browser (Chrome, Edge, Dia, Arc). Recent Firefox and Safari should work but weren’t part of the checks. |
| Operating system | macOS, Windows or Linux. |
| Internet | Needed only for `npm install`. The app makes no network requests while running. |
| Accounts, API keys, `.env` | None. |

## Run the app

```sh
git clone https://github.com/Jeyep18/InnoLab-Hackathon-2026.git
cd InnoLab-Hackathon-2026
npm install        # once, installs dependencies into node_modules/
npm run dev        # starts the app at http://localhost:5173
```

Open http://localhost:5173 in your browser. If port 5173 is busy, Vite prints the port it used instead.

### Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Runs the unit tests (Vitest): ratings, reviews, bookmarks, search, purchases, revisions, verification requests and saved-data upgrades. |
| `npm run typecheck` | TypeScript check only. |
| `npm run build` | Type check plus a production build into `dist/`. |
| `npm run preview` | Serves the production build at http://localhost:4173. Run `npm run build` first. |
| `npm run samples` | Regenerates the fictional sample files in `public/samples/` and `sample-packs/`. |
| `npm run check-assets` | Fails if demonstration-only teacher files are tracked by Git or bundled. |
| `npm run sanitize -- <in> <out>` | Copies teacher files and strips author and comment metadata (see below). |

Use `npm run dev` or `npm run preview` to show the app: the folder packs in `sample-packs/` are served by the Vite server, so opening `dist/index.html` directly isn’t enough.

### Start from a clean state

Everything you do (uploads, reviews, bookmarks, verification requests) is saved in this browser’s local storage and IndexedDB. To start over, open the account menu (your avatar, top right) and choose **Reset app data**. This restores the sample library and leaves files on disk untouched.

## Try it

The app opens as **Ma'am Joy Villanueva**, a teacher. Use **Switch account** in the avatar menu to act as someone else. There are no passwords: these are sample personas, not real accounts.

1. **Find a lesson.** Search from the homepage, or pick a school level. Open a pack to see the preview, the author’s track record, ratings, the license, the Budget of Work week and the version history.
2. **Use it.** Download the lesson plan, save the pack, rate it (you can’t rate your own), copy a share link, adapt it into your own credited version, or suggest a revision to the author.
3. **Share a lesson.** Use **Share a lesson** (top right), fill in three steps and attach files. The pack is **public as soon as you publish it**: nobody has to approve it first.
4. **Ask for verification (optional and free).** On the last Share step, or on your own pack’s page, ask a verifier to check this version. The pack shows “Not verified” until then.
5. **Verify it.** Switch to **CherIt Review Team** (the verifier) and open **Verification queue**. The request is listed under *Requested*. **Mark verified** gives the pack a “Verified v1.0” badge. Verification covers one version only, so a new version starts unverified. Packs reported by teachers are hidden and listed under *Reported* until the verifier restores them.
6. **See the Pro plan.** **Priority verification · Pro**, **Get more storage**, **New folder** on Saved packs and **Free plan · Upgrade** in the avatar menu open a dialog that compares the Free plan (current) with Pro: priority verification, more storage and bookmark folders. **Pro is display-only.**

## What is real and what is simulated

| Works for real in this browser | Simulated, sample or display-only |
| --- | --- |
| Search and filters; file previews (PDF, Word, images, text, video); downloads; bookmarks; 1–5 star reviews and their averages; uploads saved in IndexedDB that survive reload; publishing immediately; verification requests and the verifier’s Mark verified; reporting and restoring; credited adaptations; revision proposals and approval; reset | Personas (no sign-in or security); verification is a demo action, not expert or DepEd validation; seeded reviews, download counts and sales; the supplement checkout (no payment); the **Pro plan** (no checkout, no priority ordering, no extra storage, no folders; ₱149/month is a sample price); curriculum codes and Budget of Work weeks in sample packs |

Data is not synchronized between browsers or devices.

## How it’s built

- **Stack:** Vite 8, React 19, TypeScript, Tailwind CSS v4, Base UI (shadcn components), Motion for animation, lucide icons, PDF.js and docx-preview for file previews, Vitest for tests.
- **No backend.** State lives in a reducer (`src/domain/logic.ts`) and is saved to `localStorage`. Uploaded file bytes go to IndexedDB (`src/storage/fileStore.ts`). Seed data is in `src/data/catalogue.json`, and folder packs are read from `sample-packs/`.
- **Routing:** hash routes (`#/resource/<id>`, `#/share`, `#/moderation`, …), so the build is a single static page.

```text
src/
  domain/        types, reducer and business rules (+ tests)
  data/          seed catalogue and folder-pack loader
  storage/       localStorage and IndexedDB persistence
  components/    pages and features (share form, pack page, verification queue, profile …)
    site/        header, footer, cards, Pro plan dialog, scroll reveal
    ui/          shared Base UI / shadcn primitives
  pages/         homepage, browse, settings
  lib/           helpers: plans, licenses, curriculum, previews
public/samples/  fictional sample lesson files
sample-packs/    fictional packs in the teacher-folder layout
scripts/         sample generation, sanitizing and asset checks
```

## Troubleshooting

- **`npm install` fails or Vite won’t start:** check `node -v` is 22.12 or newer.
- **Port already in use:** run `npm run dev -- --port 5180`, or use the port Vite prints.
- **The app shows old data or errors after an update:** use **Reset app data** in the avatar menu. Saved data from older versions is upgraded automatically, but a reset gives a clean start.
- **Uploads fail with a storage message:** the browser blocked or filled IndexedDB, for example in a private window. Use a normal window.

## Teacher files (demonstration only)

Real teacher files are never committed. They go in the ignored `demo-assets/packs/<Teacher alias>/<Grade N - Subject - [Term N Week N] - Title>/` folder. Sanitize copies with `npm run sanitize -- "<downloaded folder>" "demo-assets/packs"`, check them by hand for learner and teacher names, then run `npm run check-assets` before any commit. Everything in `public/samples/` and `sample-packs/` is fictional.

## Project documents

- [PROJECT_MEMORY.md](PROJECT_MEMORY.md): decisions, scope and their status.
- [PLAN.md](PLAN.md): priorities, execution log and checks.
- [DEMO.md](DEMO.md): stage script, disclosures and the acceptance checklist.
- [AGENTS.md](AGENTS.md): rules for coding agents working in this repository.
- Background and research: [RESEARCH_TEACHER_RESOURCE_TOOLS.md](RESEARCH_TEACHER_RESOURCE_TOOLS.md), [HOMEPAGE_FILTER_AUDIT.md](HOMEPAGE_FILTER_AUDIT.md), [SEARCH_DIALOG_DESIGN_RESEARCH.md](SEARCH_DIALOG_DESIGN_RESEARCH.md). Earlier prompts ([BRAINSTORM_PROMPT.md](BRAINSTORM_PROMPT.md), [IMPLEMENTATION_PROMPT.md](IMPLEMENTATION_PROMPT.md), [START_IMPLEMENTATION.md](START_IMPLEMENTATION.md)) are historical.

## Team

JP (technical lead), CJ (design and creative lead) and Francis (product, QA and presentation).
