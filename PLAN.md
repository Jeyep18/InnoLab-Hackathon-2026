# CherIt prototype plan

Updated: 2026-10-26. Product scope follows team decisions in [PROJECT_MEMORY.md](PROJECT_MEMORY.md). The Vite + React + TypeScript stack is approved; the prototype is implemented on `feat/cherit-prototype` and its checks are recorded in DEMO.md. [DEMO.md](DEMO.md) owns demonstration acceptance.

## Delivery model

One locally served, presenter-controlled frontend. Build discovery, real permitted downloads, bookmarks, review calculations, profiles and local publishing/adaptation interactions. Simulate accounts and purchases explicitly. Shared data across devices and public backend services are outside scope.

Teacher files stay in ignored local storage under the restrictions in project memory. Confirm actual file availability and modification permissions. Use synthetic adaptation files when necessary.

Partner bootstrap: teacher assets do not arrive through Git pull. Missing assets do not prevent technical preflight or, after technical approval, a functional prototype using clearly fictional reusable files. Replace them only with permitted local samples; never claim illustrative mappings are official curriculum validation.

## Priorities

| Priority | Scope |
| --- | --- |
| P0 | Responsive catalogue; keyword/grade/subject/competency filters; empty/no-results states |
| P0 | Detail view: preview, actual downloads, references, requirements, rights/scope notice, version/review information and required/optional attachments |
| P0 | Bookmark toggles/saved items; review submission/editing; correct resource and contributor aggregates; sample-data disclosure |
| P0 | Alias contributor profile with resources, community rating and review count |
| P0 | Local contribution -> pending -> demo review -> published/held; actual local file bytes when upload persistence is claimed |
| P0 | Separate credited adaptation with parent resource/version and change note; original preserved |
| P0 | Labelled demo personas and sample paid-acquisition UI; no credential/financial collection |
| P0 | Reset/repeatability, file failures, local persistence, keyboard access, contrast and mobile layout |
| P1 | Expanded contextual feedback and extra visual polish after core acceptance |
| Future | Secure accounts, protected paid files, payments/payouts, public uploads, backend moderation, private revision proposals/merging, institution integrations, ads/subscriptions, offline website/editor, cross-device sync, nationwide expansion |

The lightweight simulated acquisition UI is part of the prototype; showing it in the timed live walkthrough is optional. It must not consume time needed for the real catalogue/download journey.

## Execution checkpoints

Plan around 12 hours from actual implementation start, capped by the real deadline. The earlier 12-16-hour estimate is historical. Keep the final two hours for rehearsal/submission; approve a concrete reduction if that time no longer exists.

| Checkpoint | Proposed owner | Acceptance |
| --- | --- | --- |
| Preflight, up to 1 hour | JP + Francis; CJ visual review | Inspect repo; confirm deadline/assets/permissions; propose exact stack/dependencies, compact structure, storage and verification; obtain technical approval before install |
| Discovery/download slice, by hour 4 | JP; CJ feedback; Francis scenario/data | Local app runs; permitted complete sample is found, previewed and downloaded; missing-file state and mobile/keyboard basics work |
| Feedback/profile slice, by hour 6 | JP; separate file ownership for helpers | Bookmark, review/edit, no-self-review, unrated state, weighted contributor mean and profile/saved views work |
| Contribution/adaptation, by hour 8 | JP; Francis checks | Local file submission and its stated persistence work; demo publish/hold and credited adaptation work; simulated roles/payment stay labelled |
| Freeze/verification, hours 8-10 | Francis QA; JP fixes; CJ polish | Run DEMO.md logic/browser checks; errors/reset; inspect final diff; correct in-scope defects |
| Final two hours | Team | Human-authored deck follows event rules; repeat primary journey; prepare disclosed fallback; submit within permission/deadline limits |

CJ can design while Francis prepares permission-cleared catalogue metadata/test scenarios. Confirm parallel code ownership before edits. No agent-generated pitch deck.

If a checkpoint slips, stop optional work and request approval for a concrete remaining-P0 reduction. Preserve a runnable catalogue/download slice. Do not silently substitute hard-coded success or animations for claimed behavior.

## Trust-first revision (approved 2026-10-26, implemented)

Follows the product framing and build decisions in PROJECT_MEMORY.md. All three checkpoints were completed by 22:30 on 2026-10-26. Remaining before 09:00: load teacher files if they arrive by 04:00, rehearse in Dia with Wi-Fi off, rehearse `npm run preview` on the Windows laptop, record the fallback video, then merge to `main` and submit.

| Priority | Change | Acceptance |
| --- | --- | --- |
| P0 | Pack page order: author with rating and review count, downloads/saves; then review status, current version and BOW target; then preview; then download/adapt | Trust signals visible without scrolling on a laptop; same order on phone |
| P0 | Contributor track record on the pack page | Contributor mean and review count shown beside an unrated pack |
| P0 | Vocabulary: "reviewed", never "verified"; review status shows "Not yet reviewed" or "Reviewed by demo moderator (simulated)" | No "verified" wording in the UI |
| P0 | Copy-link button for sharing a pack in Facebook groups | Link copies; confirmation announced; failure message if the clipboard is blocked |
| P0 | Browser verification of the DEMO.md journey, run twice from reset; swap in teacher files under `demo-assets/` when they arrive | Recorded in DEMO.md evidence |
| Half-build | Review queue (about 20 seconds in the demo), a prepared credited adaptation instead of a live upload, simulated checkout mentioned but not clicked | Works if clicked; not on the critical path |

Demo emphasis: show an unrated pack and how it is handled honestly, then a reviewed pack, then download. LAC distribution is deferred and stays out of the pitch.

## Technical preflight

Completed 2026-10-26: Vite + React + TypeScript approved; exact dependencies are listed in PROJECT_MEMORY.md and package.json. The original preflight guidance follows for reference.

Reuse a suitable app/packages if a teammate has initialized them. Otherwise compare the smallest suitable static React/TypeScript setup with the team's familiar alternative. Routing/UI/storage libraries must justify their cost. The journey requires no server framework.

Present exact proposed packages/commands, directory layout, asset loading, local state/file storage, file ownership and verification for approval. Browser metadata storage alone does not preserve uploaded file bytes; choose appropriate platform storage when promising reload persistence. No external service setup is required.

## Completion

Pass the relevant DEMO.md checks, inspect final diff/Git status, add actual verified run/build/test commands to README, and record tested environment/results/limitations. Distinguish seeded, simulated, implemented-but-unverified and verified behavior. Commit/push/deploy/distribution of teacher files requires separate applicable authorization.

## Design restraint pass, 2026-10-27

User authorized applying `emil-unslop-design` everywhere except Share a lesson and Review queue. Implemented with two scoped subagents and parent integration. Removed the centered home hero, decorative gradients/rings on eligible covers, repeated onboarding/CTA blocks, glass filters, static hover effects and nested detail/profile tiles. Preserved CJ's palette, local data behavior, trust disclosures and original shared defaults for excluded routes. No package installation, service setup or publication.

Verification: `bun run build` passed, including TypeScript; `bun run test` passed all 26 tests; `git diff --check` passed. Chromium checked desktop and phone layouts, light/dark appearance, Grade 4 + Science returning three packs, saved packs, lesson download eligibility/counts, 5-star review recalculation to 4.8 from four reviews and contributor 4.4 from five reviews. Excluded-route main content matched before/after screenshots at the same viewport/theme. Full upload/moderation, Dia and Windows checks remain pending. No commit or push performed.
