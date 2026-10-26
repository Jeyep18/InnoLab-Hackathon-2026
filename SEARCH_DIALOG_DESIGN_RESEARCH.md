# Search dialog design study

2026-10-27. Dialog A (category pills with stacked menus) is now the homepage search dialog. The studies below record how that choice was reached. Teacher comprehension of the group names is still untested.

## Sources and findings

- The supplied **emil-design-foundations** guide calls for one primary action, hierarchy through subtraction, sections grouped by the user's task, persistent labels, and a primary action that stays reachable. Applied its Core principles 1–3, Information Architecture 1/3/10, Layout & Spacing 7, Copywriting 3, and Components 1. Read from the user-supplied local guide; no copy of the external skill is bundled here.
- [Nielsen Norman Group, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): keep frequently needed features accessible, reveal specialized options on request, and name disclosure triggers so users can predict their contents. Distinguishes optional progressive disclosure from a mandatory sequence of wizard steps. **Application here:** keyword search remains available without opening any filter section. These categories are a design hypothesis based on existing fields, not measured usage frequency.
- [Carbon, Filtering](https://www.carbondesignsystem.com/building-blocks/core/patterns/filtering): batch filtering applies several choices together on an explicit action; multiple filter categories need understandable grouping. Hidden selections need a visible indicator and a clearing mechanism. **Application here:** modal drafts apply only on Search; collapsed rows summarize choices; the launcher reports applied filter count; Clear filters appears only when filters exist.
- [Carbon, Disclosures](https://www.carbondesignsystem.com/building-blocks/core/patterns/disclosures): disclosures should be user-initiated and concise; avoid stacking disclosures, and keep attention on one at a time. **Application here:** one inline accordion panel at a time instead of the former dropdowns inside a generic expanded filter dump. The centered modal remains the user-requested container; Carbon's popover size guidance is not treated as a modal specification.
- [Official shadcn Base UI accordion registry](https://ui.shadcn.com/r/styles/base-nova/accordion.json) supplies the local wrapper's structure. Installed Base UI accordion type declarations were checked for single-open behavior and accessible trigger/panel APIs. No package installed.

## Review of the previous dialog

| Before | After | Why |
| --- | --- | --- |
| Explanatory paragraph below title | Title and persistent keyword label only | Removes copy the user explicitly rejected; the controls explain the task. |
| Reset opposite Search even when empty | Conditional Clear filters beside filter groups | Makes clearing contextual and keeps one primary action. Clearing retains the keyword. |
| Three dropdowns and a generic More filters row | Named filter sections with collapsed selection summaries | Users can predict what each section contains. |
| Eight advanced fields revealed together | One inline section open at a time | Avoids a long undifferentiated form and nested filter popovers. |
| Footer divider and widely separated actions that scroll | One full-width Search lessons action outside the scrolling body | Keeps the action reachable in expanded/mobile states. |
| Generic find-a-lesson hero and pack terminology | Plan your next class. Skip the blank page. | Connects to starting lesson preparation from an existing resource. Supporting copy names lesson plans, slides and worksheets and says to adapt them. No measured time-saving claim. |

## Proposed grouping

- Class & subject: school level, grade, subject.
- Curriculum: competency, term/quarter, BOW week.
- Classroom & files: internet/printing needs, file type, editable files, optional supplements.
- Reviews: current-version feedback and simulated curriculum-review choices. Simulated status remains explicit in selected summaries.

No filter starts selected. Exploration categories stay independent. Dismissing the dialog discards draft edits; reopening restores the last submitted query and filters. Search submits them atomically. No mandatory steps, new backend, or result preview.

## Validation

Build/typecheck and focused Chromium interaction checks are recorded in PROJECT_MEMORY.md. Teacher comprehension of the group names and the revised hero remains untested. Show the prototype to the team before promoting it to the default homepage.

## Subsequent prototype feedback

The user rejected the accordion implementation while keeping its categorization. The current studies share the same homepage, keyword field, draft state and explicit Search action:

- A, `#/?variant=A&dialog=A`: four category pills with stacked nested menus. A category initially shows filter names; a filter opens only its own choices. The previous category heading repeated the pill label and was removed.
- B, `#/?variant=A&dialog=B`: category overview cards. A card opens a separate editor within a fixed dialog; choosing a filter reveals its values, with Back navigation.
- C, `#/?variant=A&dialog=C`: add only the desired filter controls. The picker reveals category, then filter; a chosen control reveals its choices.

A follows the supplied [Moumen Unlimited Nested Menu](https://lab.moumen.dev/components/unlimited-nested-menu) reference's stacked-parent model. Parent rows remain behind and dimmed while the child overlays the chosen row. Adapted with existing shadcn Base UI Menu primitives rather than installing the reference's custom runtime. The reference's full shared-element morph and unlimited depth are not reproduced; this prototype has the depth its filters need. Checkbox/radio choices stay open for filtering; Left, Right, Escape and Back were checked. Hover does not open a child panel.

Latest copy overrides: 'A head start on your next lesson'; contributor strip 'Share your lessons and offer paid extras through your contributor profile'. Payments remain simulated in the existing global demo disclosure.

## Discovery card hierarchy correction

| Before | After | Why |
| --- | --- | --- |
| Oversized rank beside contributor and stats | Rank placed in the cover's top-right corner | Removes competition within the metadata area. |
| Five stars, review count, large download icon and count run together | One star, rating and review count on the left; matched download icon and count on the right | Gives each metric its own space and baseline. |
| Small contributor text mixed with metrics | Contributor on its own 14px line above the stats | Separates attribution from activity. |
| Repeated sample-activity and shelf helper lines | Global demo disclosure retained; redundant local helpers removed | Avoids repeated copy while preserving disclosure. Downloads remain popularity, not a trust guarantee. |

Chromium checked separate metrics without overlap, matching baselines, and phone overflow. Group names and layout preferences still require user selection.
