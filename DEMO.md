# CherIt demonstration

Status: working local prototype; checks below were run on 2026-10-26 unless marked otherwise. [PROJECT_MEMORY.md](PROJECT_MEMORY.md) defines scope/permissions and [PLAN.md](PLAN.md) defines execution.

## Disclosure and audience

Initial audience: Bicol public-school teachers. One presenter-controlled browser runs locally with aliases and sanitized, demonstration-only teacher files. Responsive devices do not imply live synchronized accounts.

Show a concise notice: "Demonstration prototype: sample accounts, reviews and activity counts; payments simulated." Seeded opinions must never be attributed to real teachers. Genuine teacher feedback, if supplied with permission, remains distinct.

Demo actions do not prove curriculum review, identity, affiliation, ownership, classroom use, secure authentication or real payment. Downloaded files can be used in external software; full offline website/editing is not promised.

## Primary journey (stage script)

Run `npm run dev`, open http://localhost:5173 in Dia, press **Reset demo**. Expected values assume a fresh reset.

1. Persona is **Ma'am Joy** (demo teacher). The banner states sample accounts, reviews and counts, and simulated payments.
2. On the home sentence pick **Grade 4** and **Science**. Three packs appear: "The water cycle around Mayon" (4.7 from 3, curriculum-reviewed, simulated) next to its **Bikol vocabulary version** (No reviews yet, Not yet reviewed).
3. Open the **Bikol vocabulary version**. Before you download: Ma'am Tess's track record 5.0 (1), "No reviews yet", 0 downloads, "Not yet reviewed" with "the original's review doesn't carry over", credit to the original v2.0 by Ma'am Lira.
4. Click the original. Trust panel: Ma'am Lira 4.3 (4), this version 4.7 from 3 reviews, 38 downloads, curriculum-reviewed (simulated), version 2.0 replacing 1.0, Term 2 Week 3. The older-version review is listed separately and excluded.
5. Scroll past the pad-paper preview and download the lesson plan (a real .docx). Downloads become 39.
6. Rate 5 stars and post. This version becomes **4.8 from 4**; Ma'am Lira's track record becomes **4.4 (5)**.
7. **Copy link to share** shows the copied link and a simulated group-post preview with contributor, rating and review status.
8. Only if time allows: switch persona to **Demo moderator**, open **Review queue**, mark a pack curriculum-reviewed (simulated).

The trust panel labels sample data where averages appear ("Includes only sample reviews", "including sample reviews" on the track record).

Backup moments for Q&A: Ma'am Lira cannot rate her own pack; "Reading typhoon signals" shows a missing optional file; "Percent at the palengke" has a simulated ₱49 supplement checkout; **Share a lesson** stores a real uploaded file that survives reload and waits for review.

## Acceptance checklist

- [x] Install/start/build/test/reset commands run: `npm install`, `npm run dev`, `npm test` (26 passing), `npm run build`, `npm run preview`, and the Reset demo button.
- [x] Search/filter: Grade 4 + Science returns the three expected packs; unmatched keywords show "No lesson packs match" with recovery actions; the typhoon pack's missing optional file shows an error and is not counted as a download.
- [x] Preview/download: lesson-plan .docx downloaded at its exact size (4,082 bytes); folder-pack PDF previews render in Chromium's viewer.
- [x] Bookmark toggles once per persona; count 6 → 7 → 6; Saved view and count survive reload; empty Saved state shown.
- [x] One editable review per persona/resource; self-rating blocked for the contributor; posting without a rating shows "Choose a rating from 1 to 5 stars"; unrated packs say "No reviews yet". Unit tests cover the 1-5 range.
- [x] Contributor mean uses underlying reviews (4.25 shown as 4.3, not the 3.8 average of averages); edit 5 → 3 recalculated to 4.3 / 4.0; reset restores baselines (unit tests and browser).
- [x] Older-version review labelled and excluded; an edit moves a persona's review to the current version (unit test).
- [x] Download counts are events, including repeats; sample counts and reviews labelled.
- [x] Upload: empty file and .exe rejected with messages; valid .docx + .txt submitted; bytes survive reload (re-downloaded at 3,701 bytes). Not run: storage-full failure (handled in code, untested).
- [x] Pending → publish and report → hold change state; review queue labelled as simulated, not expert review.
- [x] Adaptation credits parent and version, keeps the original unchanged, starts "Not yet reviewed".
- [x] Journey steps 1-6 completed twice from reset with identical results.
- [x] Laptop (1366), tablet (iPad Air 820) and phone (iPhone 12 Pro 390) layouts; keyboard Tab/Enter to open a pack with a visible 3px focus ring; route change moves focus to content and scrolls to top. All text colour pairs ≥ 4.59:1; control borders and rating stars ≥ 3:1.
- [ ] Check real teacher documents, metadata and screenshots once they arrive. The sanitize script was tested on fictional files carrying Word/PowerPoint/Excel author, comment, co-author and PDF Author fields; it cannot clean compressed PDF metadata and says so.
- [x] `npm run check-assets` passes, and fails on a renamed teacher-file copy in `public/` (tested). Raw `/demo-assets/` URLs return 404. No external network requests in the bundle. A fresh clone passes install, tests, build, check-assets and byte-identical sample regeneration.
- [x] Independent code review: fixed stale state between pack pages, manifest failure on one unreadable file, sanitizer gaps and unrated wording.
- [ ] Disconnect Wi-Fi on the demo Mac and repeat the journey (expected to work: no network dependencies found).
- [ ] Record the fallback video in Dia after the freeze; rehearse `npm run preview` once on the Windows laptop.
- [ ] Rehearse timing and confirm submission sharing respects teacher permissions.

## Evidence

2026-10-27 buyer-modal refinement: browser check of the seeded paid pack confirmed an attached lesson-plan Download button, no iframe viewer, reviews-only sidebar, product-card entry, Files / Billing / Verify / Download steps with prefilled synthetic billing data, simulated unlock and an actual downloaded ZIP. The ZIP passed `unzip -t`. No real payment details were sent or collected.

2026-10-27 supplemental-bundle checks, automated browser on macOS: submitted a synthetic free text plan, a four-page sample PDF and a video placeholder; selected page 1 visible and pages 2–4 blurred; persisted the three files and four preview images; published through the moderator UI; switched to a second teacher; loaded all four approved preview images and unlocked both supplements with one simulated purchase. The video placeholder tested locking and acquisition, not playback. Unit checks cover bundle-wide acquisition, repeat purchase idempotence, persona separation and unpublished-pack rejection. Real payments, protected file delivery, storage-full recovery and Windows are not verified by this check.

2026-10-26, branch `feat/cherit-prototype`, macOS, Node 25.9, Chromium-based automated preview browser (not Dia itself). Dev-server hot reload during editing once crashed the page (development only); an error screen with Reload and Reset now prevents a blank page. Rehearse once in Dia itself before presenting.

Do not invent endorsements, partnerships, review results or workload savings.

2026-10-27 design restraint pass: `bun run build` passed TypeScript and production bundling; `bun run test` passed 26 tests; `git diff --check` passed. Separate Chromium session checked desktop 1366px, phone 390px and tablet 820px layouts, light/dark appearance, URL-filtered Grade 4 + Science returning three packs, save-to-Saved navigation, missing-resource/no-results states, lesson-plan download action and review eligibility. Posting five stars produced 4.8 from four current-version reviews and contributor rating 4.4 from five reviews. Share a lesson and Review queue received no new route-scoped styles; their main content was pixel-identical in same-viewport/theme before/after screenshots. This was a focused regression pass, not a new full upload/moderation, Dia or Windows rehearsal.
