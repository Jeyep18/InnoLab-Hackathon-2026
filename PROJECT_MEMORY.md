# Project memory

Updated: 2026-10-26, Asia/Manila. Decisions live here; [PLAN.md](PLAN.md) records execution and [DEMO.md](DEMO.md) defines acceptance.

## Confirmed context

- Product: **CherIt**, pronounced "Share it". Team-proposed tagline: "Cher mo na".
- Theme: Tech with Purpose. Challenge: empower a Bicol community, nonprofit, or grassroots movement to address a present problem. Focus: education and learning access.
- Initial audience: Bicol public-school teachers. Nationwide expansion is deferred.
- Team: JP technical lead/integration; CJ design/creative; Francis product, QA and presentation. Confirm file ownership before parallel code edits.
- Event: October 26-27, 2026. Last reported remaining build window: 12-16 hours. This is a dated estimate, not a live countdown; exact submission time remains unknown.
- Presentation: 8 minutes pitch/demo, 4 minutes Q&A. AI prototype assistance is allowed; AI-generated pitch decks are prohibited. Mentors advise and do not create deliverables. Confirm event rules for external resource contributions where relevant.
- Demonstration: **one presenter-controlled browser**. Shared live data across devices is unnecessary; responsive phone/tablet/laptop layouts still matter.
- Constraints carried forward: free-tier API access only, lightweight technologies preferred, Windows/Mac laptops available, network reliability untested. The current local prototype needs no API.
- Official rubric: innovation/creativity 25%; technical feasibility 20%; theme relevance 20%; impact/sustainability 20%; presentation/delivery 15%.
- Interviewed teachers permitted their files **only for the demonstration**, using placeholder names. Public hosting, redistribution, sales and publication of their real names are not authorized.
- Clarified 2026-10-26: "public sharing for the demo" means showing teacher files on screen during the presentation only. No public website, Git or redistribution. Three teachers will supply copies of their files before the presentation; exact arrival time is unknown.
- The team agreed to the revised prototype direction. On October 26 the user explicitly authorized updating, committing and pushing this documentation/handoff batch so a partner can pull it. Framework/dependencies remain unselected; installation, scaffolding, deployment and future implementation commits/pushes require their applicable approval.

## Evidence and product direction

Reported interviews describe preparation workload, varied learner needs, resource access friction, classroom constraints and unreliable internet. Follow-up answers about the dominant effort, actual grade/subject/BOW and representative lesson files are still being gathered. Expected interview answers are hypotheses, not confirmed findings.

Team-approved direction: teacher-contributed lesson packs, searchable by curriculum reference and classroom context, with sources, permissions, contributor credit and adaptations. Existing tools overlap this model. The opportunity is easier discovery and reuse in the local teaching workflow, not inventing teacher-resource sharing.

> For Bicol public-school teachers who struggle to prepare curriculum-aligned lessons, CherIt helps them find, download and adapt reusable lesson packs matched to their Budget of Work and classroom resources, so they can prepare lessons from an existing foundation while preserving contributors' credit.

No workload reduction, literacy improvement, adoption, institutional partnership or funding has been measured or confirmed.

### Interview signals, reported 2026-10-26

Aggregated teacher reports, not individual dated accounts: teachers find materials online, compile and rewrite lesson plans manually for each class and BOW week, and buy some PPTs/materials from Facebook and other sites without knowing whether they are credible. Reported wording: buying online "is like gambling"; preparing takes longer than teaching. No named teacher, specific lesson or timed example was disclosed.

Follow-up with the three teachers supplying demo files: all three said yes to uploading their exact pack for other Bicol teachers. Their main concern is low-quality uploads; copying matters mainly where they want credit for their own intellectual property. Given the opportunity, they would sell supplementary resources. Treat this as a small, friendly, self-reported signal, not demand evidence.

### Product framing, approved by JP 2026-10-26

- One good idea: a teacher can tell whether a lesson pack is legit *before* using it. Show who made it, its rating next to the review count, downloads/saves, review status, current version and BOW target before the preview and download.
- CherIt does not claim packs are correct. It makes checkable signals visible. Use "reviewed", never "verified". Label every demo review action as simulated. Institutional or expert reviewers are a future goal, not a current claim.
- Cold start: an unrated pack says "No reviews yet" and never shows fake stars; fall back on the contributor's track record across their other packs, with review counts. Downloads are popularity, not credibility.
- Chain of must-be-trues: (1) teachers lose hours and gamble on unjudgeable files; (2) teachers with good packs will upload them for credit, track record and possible supplement income; (3) visible trust signals make a teacher pick a CherIt pack over a Facebook file, which is the link the demo tests; (4) downloads turn into reviews and adaptations, and shared links bring new teachers.
- Distribution for the pitch: the three supplying teachers, plus CherIt links shared in Facebook groups that show contributor name and rating. LAC sessions and Master Teacher reviewers are **deferred**; the team has not confirmed how LAC works at the teachers' schools. Partner institutions and NGO endorsements do not exist; describe them only as something CherIt would seek.
- Sustainability: core packs stay free; CherIt would take a small commission on optional paid supplements. Payments remain simulated.
- Impact metric: pilot goal, not a result. Minutes from "I need a Grade 4 Science Week 3 lesson" to an editable, classroom-ready file, timed with the three teachers against their usual workflow. Headline target: "from an evening of searching to under 15 minutes."

## Agreed prototype scope

| Area | Decision |
| --- | --- |
| Library | Small Bicol-focused collection; search/filter; resource detail, preview, editable download where supplied, attachments, references, classroom requirements, version and permissions |
| Contribution | Functional local file submission, pending review, publication and reported-resource hold; demo personas demonstrate workflow, not secure accounts |
| Adaptation | Separate uploaded resource linked to original resource/version, with original credit and change note; private proposals and merging are deferred |
| Bookmarks | Save/unsave resources and show bookmark count; no separate star endorsement action |
| Ratings/reviews | Stars mean 1-5 ratings plus feedback after demo download/acquisition; classroom use remains self-reported |
| Statistics | Show average rating with review count, bookmark count and download events; seeded baselines are illustrative |
| Profiles | Public-style contributor profile within the local demo, with aliases, resources, community rating and review count |
| Accounts/payment | Explicitly simulated personas and checkout; no passwords, financial details, money, payouts or verified-buyer claims |
| Offline | Downloaded files may be used in suitable external software; offline website/editor and automatic sync are deferred |
| Services | No backend, database, AI API, institutional integration or cross-device sync is needed for the recommended single-browser prototype |

Behavior definitions:
- One bookmark and one editable review per demo persona/resource. Prevent self-rating within the demo flow. Editing a review replaces its previous rating.
- Resource rating = mean of its underlying ratings. Unrated resources show "No reviews yet", not zero stars.
- Contributor rating = mean of underlying reviews across that contributor's published resources, not an unweighted average of resource averages. Show review count; do not label this proof of credibility or ownership. Attribute each review to one resource.
- Count initiated download actions consistently as events, not unique teachers, successful teaching or impact.
- Clearly identify seeded reviews/counts as sample data. New interactions update local state. Mock identity permits no real cross-user enforcement.
- Reviews retain resource-version context. Changed educational content requires fresh curriculum review; earlier approval does not automatically apply.
- Displayed resource and contributor means use reviews of the current published resource versions. Older-version feedback, if shown, is labelled and excluded from these means/counts. A review edited for a new version replaces that persona's previous review for the resource.
- Identity checks, rights declarations, curriculum review and classroom feedback are separate claims. Display actual institutional affiliations or academic review only with supporting evidence. Demo reviewer actions are not real expert validation.
- Identify required versus optional attachments. The free core lesson should be usable without an undisclosed essential paid attachment. Sample prices are illustrative, not permission to sell teacher files.

## Demonstration-only assets

- Keep teacher files, previews and local permission records under ignored `demo-assets/`. Preserve originals. Do not commit, push, publicly deploy or send these files to external conversion/AI services.
- Sanitize document content, file names and metadata for student information and contributor identity. Placeholder profile names alone do not anonymize a file.
- Record asset aliases and permission details locally, outside tracked documentation. Permission to modify originals or redistribute derivatives has not been confirmed; clarify before those actions. Use a clearly fictional team-created adaptation to exercise the workflow if needed.
- Do not assign a Creative Commons license or "free to redistribute" status without authority. Use an accurate demonstration-use notice for supplied files.
- Builds, recordings and submission artifacts embedding these files inherit their permission limits. Confirm required submission sharing is allowed; otherwise sanitize/substitute assets or request broader permission.
- Mock sign-in or checkout does not protect public files. Keep this demonstration local.
- Sanitized catalogue metadata and fictional personas can be tracked; identifying metadata and teacher files cannot.
- Ignored teacher files will not arrive through Git pull. Continue technical preflight without them; after technical approval, use clearly fictional, reusable sample files to build and test discovery/download/adaptation until permitted local files are supplied. Label synthetic curriculum references as examples rather than verified alignment.

## Visual direction

CJ owns visual review. Team-supplied palette:

| Role | Color | Hex |
| --- | --- | --- |
| Page | Cream Linen | #FAF7F2 |
| Surface | Pale Cashmere | #EFECE6 |
| Primary accent | Dusty Mauve | #8C6D79 |
| Secondary accent | Olive Moss | #7A8B68 |
| Primary text | Espresso Brown | #332C27 |
| Muted text | Taupe Gray | #6E655F |

Measured declared-color contrast: espresso/cream 12.84:1; muted/cream 5.33:1; muted/surface 4.83:1. Cream/mauve 4.29:1 and white/olive 3.67:1 fail normal-text 4.5:1. White/mauve is 4.59:1. Preserve the palette and choose accessible foreground roles, such as a white utility label on mauve; avoid normal-text olive-filled buttons. Rendered UI/states are not yet tested.

## Current state and next gates

- Stack approved by JP 2026-10-26: Vite + React + TypeScript; dependencies react, react-dom; dev dependencies vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom, vitest, plus @types/node for the Vite config. No router or UI library. Metadata in localStorage; uploaded file bytes in IndexedDB; teacher files served locally from ignored `demo-assets/`, never bundled into `dist/`.
- Implemented and checked 2026-10-26 on branch `feat/cherit-prototype` (pushed at checkpoints 20f5590, dc4a6a1, 2a04779): trust-first pack page, two-layer review model, seeded adaptation, bookmarks, reviews and aggregates, profiles, uploads persisted in IndexedDB, review queue (publish/hold/mark reviewed), report hold, simulated checkout, copy-link share preview, folder packs from `sample-packs/` and ignored `demo-assets/packs/`, sanitize and check-assets scripts, reset and error recovery. Evidence and remaining unchecked items are in DEMO.md; checks ran in an automated Chromium preview, not yet in Dia, Wi-Fi off or on the Windows laptop.
- Build decisions approved by JP 2026-10-26 (grilling session), superseding the hold above:
  - Schedule: submission 09:00 on 2026-10-27, presentation 13:00. Features complete by 06:00, debug/polish 06:00-09:00, rehearsal and fallback recording 09:00-13:00. After submission, only separately committed fixes for demo-breaking defects.
  - Demo runs on the team Mac in Dia (Chromium). JP edits and debugs the code. The feature branch may be committed/pushed at verified checkpoints; merging to `main` at the 09:00 submission is approved.
  - Two review layers: demo moderation (files, permission, no learner data) publishes a pack; curriculum review is a separate per-version badge, always labelled simulated. Sample packs Water cycle v2.0 and Percent at the palengke start reviewed. A seeded fictional adaptation (Bikol vocabulary version by Ma'am Tess) shows the unrated/unreviewed case.
  - Teacher files arrive via a Google Drive folder shared with team members only, are downloaded into ignored `demo-assets/`, and the share is removed after the event. Cutoff 04:00. Layout `demo-assets/packs/<alias>/<Grade - Subject - Title>/files`, no per-pack template. PDFs/images preview natively; Word/PowerPoint are previewed through PDF copies exported locally on the Mac after sanitizing, originals stay the download. JP checks content by eye; a local script writes property-stripped copies without touching originals.
  - Placeholder reviews and counts may appear on real teacher packs for the demo, disclosed on stage: fixed set of two "Sample review" entries (4 and 5 stars) by sample authors, never in the teacher's voice, plus small labelled counts. This relaxes the earlier rule against seeded opinions on real teachers' work.
  - If teacher files do not arrive, use fictional placeholder packs (lesson plans, PPTs, worksheets) in the same folder layout and present them as mock data.
  - In-app Share form keeps title, grade, subject, competency and the permission declaration required; files are free-form.
  - Fallback: local screen recording of the journey in Dia after freeze, plus the production build rehearsed once on the Windows laptop.
- Pending: exact deadline; teacher file arrival and formats; starter grade/subject/BOW; modification permission; actual reviewer availability.
- Frontend redesign, decided by the user 2026-10-26 (grilling session) and implemented on branch `feat/ui-redesign` (uncommitted at time of writing): supersedes "no UI library" in the stack above. Added Tailwind v4, shadcn (radix-nova, npm), Fluid Functionalism typography with the scale raised to 16px body, Inter bundled locally, lucide, sonner and motion. Marketplace layout ("B"): landing home with subject tiles, Top reviewed and Recently shared; `#/browse` with URL-synced filters and chips; product-style pack page with a trust card beside the title; three-step Share wizard; Review queue as tabs and table; profile and saved grids. CJ's palette mapped to shadcn tokens plus a derived dark mode with a header toggle. Generated subject-tinted card covers (no images). Pending: CJ's logo replaces the temporary wordmark; card-cover choice to be confirmed. Checked: typecheck, 26 tests, production build, and a browser pass of home, browse, pack page, share step 1 and review queue at desktop and phone widths. Not yet checked: the full upload-to-publish journey in the new UI, Dia, and the Windows laptop.
- Public marketplace, real authentication/payments, nationwide scope, full offline editing and automatic institutional maintenance are superseded/deferred.
- Previous repository initialization/publication was separately authorized. This documentation batch is also authorized for commit/push; inspect actual Git state for publication status rather than assuming this text proves a successful push.
- Earlier setup observed Git, Node/npm and Python availability; recheck the actual environment during technical preflight rather than treating this as framework selection.
- This revision used better-colors for measured palette checks, writing-for-agents for the handoff, and a scoped read-only reviewer. No skill or dependency was installed.
- Coding session 2026-10-26 used frontend-design for the UI direction and emil-product-thinking for the product interview behind the framing above. No skill was installed.
- Research and limitations: [RESEARCH_TEACHER_RESOURCE_TOOLS.md](RESEARCH_TEACHER_RESOURCE_TOOLS.md). It is context, not the implementation contract.
- Use [IMPLEMENTATION_PROMPT.md](IMPLEMENTATION_PROMPT.md) in the coding conversation. Record actual milestones and test evidence only.
