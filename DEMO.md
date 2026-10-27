# CherIt demonstration

Status: working local prototype; checks below were run on 2026-10-26 unless marked otherwise. Uploads are public immediately; verification is optional (see step 8). [PROJECT_MEMORY.md](PROJECT_MEMORY.md) defines scope/permissions and [PLAN.md](PLAN.md) defines execution.

## Disclosure and audience

Initial audience: Bicol public-school teachers. One presenter-controlled browser runs locally with aliases and sanitized, demonstration-only teacher files. Responsive devices do not imply live synchronized accounts.

Show a concise notice: "Demonstration prototype: sample accounts, reviews and activity counts; payments simulated." Seeded opinions must never be attributed to real teachers. Genuine teacher feedback, if supplied with permission, remains distinct.

Demo actions do not prove curriculum review, identity, affiliation, ownership, classroom use, secure authentication or real payment. Downloaded files can be used in external software; full offline website/editing is not promised.

## Primary journey (stage script)

Run `npm run dev`, open http://localhost:5173 in Dia, press **Reset demo**. Expected values assume a fresh reset.

1. Persona is **Ma'am Joy** (demo teacher). The banner states sample accounts, reviews and counts, and simulated payments.
2. On the home sentence pick **Grade 4** and **Science**. Three packs appear: "The water cycle around Mayon" (4.7 from 3, Verified v2.0) next to its **Bikol vocabulary version** (No reviews yet, Not verified).
3. Open the **Bikol vocabulary version**. Before you download: Ma'am Tess's track record 5.0 (1), "No reviews yet", 0 downloads, "Not verified" with "Reviews of the original don’t carry over", credit to the original v2.0 by Ma'am Lira.
4. Click the original. Trust panel: Ma'am Lira 4.3 (4), this version 4.7 from 3 reviews, 38 downloads, Verified v2.0, version 2.0 replacing 1.0, Term 2 Week 3. The older-version review is listed separately and excluded.
5. Scroll past the pad-paper preview and download the lesson plan (a real .docx). Downloads become 39.
6. Rate 5 stars and post. This version becomes **4.8 from 4**; Ma'am Lira's track record becomes **4.4 (5)**.
7. **Copy link to share** shows the copied link and a simulated group-post preview with contributor, rating and review status.
8. Only if time allows: as Ma'am Joy, open her pack "Writing a friendly letter to a pen pal" and press **Request verification (free)**; press **Get priority with Pro** to show the Free vs Pro plan dialog (display only). Switch to **CherIt Review Team**, open **Verification queue**, and press **Mark verified** on the request.

The trust panel labels sample data where averages appear ("Includes only sample reviews", "including sample reviews" on the track record).

Backup moments for Q&A: Ma'am Lira cannot rate her own pack; "Reading typhoon signals" shows a missing optional file; "Percent at the palengke" has a simulated ₱49 supplement checkout; **Share a lesson** stores a real uploaded file that survives reload and is public immediately, with optional free verification.

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
- [x] Upload is public immediately; optional verification request → verifier queue → Mark verified (2026-10-27, Chromium); report → hidden until restored. Verification is a demo action, not expert review.
- [x] Pro plan dialog opens from the Share form, storage meter, pack page, Saved and the account menu; upgrading only shows a "not part of this demo" notice.
- [x] Adaptation credits parent and version, keeps the original unchanged, starts "Not verified".
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


2026-10-27 Share/bundle refinement checks, automated browser on macOS: Next on an empty step 1 showed the floating error card with 6 items; on step 2, the compact list and "Add more files" bar appeared after upload; a sample .docx lesson plan previewed in the dialog; price and preview-page errors showed beside their fields and in the card; Review blocked submission until a license and permission were set; a pack with the CC BY-NC-SA license and a ₱49 three-page PDF bundle (page 1 readable) was submitted. After publishing it and switching to Ma'am Lira by editing localStorage directly (not through the moderator UI), the bundle preview listed 1 of 3 pages readable and showed pages 2–3 blurred with lock labels. Typecheck, 40 tests and the production build pass. Not checked: phone width, Dia, Windows, PowerPoint files, large .docx files with complex layouts, and the owner's buyer-view toggle.

2026-10-27 pack page compaction checks, automated browser at 1280×800: the full pack page is about 1,500 px tall; the preview scrolls on its own; the bundle dialog's close button stayed visible after scrolling the preview to the bottom; a locked-page label opened checkout; the GCash simulation stepped through its stages to a receipt and unlocked the bundle. Not checked: card method, phone width, and the sidebar review dialog for a teacher who has downloaded the pack.

2026-10-27 no-PDF-copy check: a paid bundle with one .docx supplement and a ₱30 price passed step 2 to Review with no errors; the card read "No online preview. Buyers download it to open it." Submission and the buyer modal for this case were not run.

2026-10-27 merge with the homepage/Base UI update: rebased onto `fa3d55b`, ported the review-dialog trigger and payment-dialog dismissal guard to Base UI, and recorded `docx-preview` in `bun.lock`. Typecheck, 40 tests and the production build pass. On a fresh dev server: the new homepage renders; on "Percent at the palengke", the sidebar reviews dialog opened, card checkout ran to a receipt, and Escape did not close the dialog mid-payment; the Share wizard showed the floating error card, a .docx preview, and the license step.

2026-10-27 realism, profile and revisions checks: typecheck, 47 tests (7 new for revisions, migration and earnings) and the production build pass. In the browser: the profile header, sidebar and earnings rendered for Ma'am Joy Villanueva; she sent a revision for the water-cycle answer key; Ma'am Lira Bañares compared the files and approved it; the pack became version 2.1 and the history credited Ma'am Joy. Schema 2 data in the browser upgraded without loss. Twelve routes were scanned for "sample", "demo", "simulated", "fictional", "placeholder" and "illustrative" with no matches. The step-by-step journey above still references old names and the old homepage and needs rewriting. Not checked: phone widths, the moderator's profile and the notifications tab.

2026-10-27 public uploads, verification and Pro display: typecheck, 51 tests (4 new: request rules, closing a request on verify, schema 3 → 4 migration) and the production build pass; `npm run check-assets` passes. In Chromium: a new upload with a .docx lesson plan went public on submit and created a free verification request; as the verifier, the request appeared under Requested and Mark verified cleared it and set Verified v1.0; the Pro plan dialog opened from the author’s pack page. Scroll/fade animations and the ui-polish pass were checked by build and code review only, not watched by eye. Not checked: phone widths, Dia, Windows.
