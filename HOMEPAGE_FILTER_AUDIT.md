# Homepage filter audit

2026-10-27. Applied to the main homepage at `#/`. Browse retains its existing filter scope.

## Available factors

| Group | Existing metadata and homepage controls |
| --- | --- |
| Curriculum | School level derived from grade; exact grade; subject; competency code/text; BOW term/quarter and week |
| Classroom | Explicit no-internet declaration or offline-ready tag; explicit internet-required declaration; unspecified internet needs; low-print tag |
| Files | Actual file extensions; includes editable files |
| Trust | Curriculum review matching current version, labelled simulated; no curriculum review; has/no current-version community reviews |
| Supplements | Includes optional sample-priced supplement, simulated. Core files may still be free |
| Search | Title, summary, grade, subject, competency, requirements and tags |
| Sort | Best match, top reviewed, newest, most downloaded |

Contributor, adaptation parent, references, permissions, version/history, required versus optional files, file sizes, bookmarks and classroom-use feedback also exist. Keep these visible in details; they are not all useful primary filters. Publication status already excludes pending and held packs.

No structured lesson duration, class size, language, accessibility, projector/device requirement or validated resource-type field exists. Do not invent those filters from titles. Folder packs may have no requirements. All seven seeds declare no internet needed. Share currently offers Kindergarten through Grade 10, so Senior high school discovery can be empty; expanding contribution grades is separate work.

## Continuity

Search, sidebar subjects and dropdowns share one URL-backed state. Subject, classroom needs and formats support multiple selections, OR within a group and AND across groups. Incompatible grade/subject/competency/BOW selections clear on curriculum changes. Active selections are removable individually; Clear all resets search and filters. Sorting remains separate. Missing internet metadata never means offline.

## Mobbin observation

Tested the user's open Mobbin tab at desktop width. Category selection opens a filtered results route and updates its URL. Education showed 38 apps. Adding AI kept the category dropdown open, changed its trigger to Categories 2, and showed 78 apps. Selected values remain visible inside the dropdown. Sort opens a separate menu with Latest, Most popular and Top rated. These observations support multi-select categories, selection counts, immediate results and separate sorting. Sort-change execution was not verified. Restored the original discovery URL after testing.

Sources: `src/domain/types.ts`, `src/domain/logic.ts`, `src/components/ShareForm.tsx`, `src/data/folderPacks.ts`; live browser interaction at https://mobbin.com/discover/apps/ios/latest and its category results routes.
