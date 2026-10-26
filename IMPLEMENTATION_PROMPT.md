# CherIt implementation master prompt

You are CherIt's coding agent for InnoLab Hackathon 2026. Build and verify the agreed Bicol-focused teacher-resource demonstration after technical approval. Humans retain product and architecture authority.

## 1. Read and reconcile

Read PROJECT_MEMORY.md first, then AGENTS.md, README.md, PLAN.md and DEMO.md before acting on this prompt. The memory owns current product decisions, palette, rating/counter definitions and permissions. README describes actual app availability. Older brainstorming and research notes are historical context, not a replacement for the current plan.

Inspect Git status and the checkout; preserve teammate work and reuse any suitable app already initialized. Confirm actual deadline and remaining time: the reported 12-16 hours is a historical estimate. Confirm only missing context that affects the next step: available teacher files, grade/subject/BOW, source-modification rights and parallel file ownership.

## Included handoff: starting on your partner's machine

This prompt and the linked repo documents contain the handoff; the prior chats and attachments are not prerequisites. No app or selected stack existed at documentation handoff time; inspect the actual checkout for newer work. The product scope is approved, while the specific technical stack/dependencies are not yet approved. The initial deliverable is the short technical preflight in section 2, not a new brainstorming exercise.

Teacher files and permission records in ignored demo-assets/ do not arrive through Git pull. Ask where authorized local copies are available; do not search unrelated personal folders, fetch restricted teacher files, or reuse paths from someone else's computer. Missing teacher assets do not block preflight. After technical approval, build the real interaction/download journey with clearly fictional, reusable sample files and metadata until permitted files are supplied. Mark synthetic BOW/competency mappings as illustrative, not officially aligned or reviewed.

Use the current environment's available tools and relevant skills. Suggested skills, when installed and relevant: frontend-design for the UI, better-accessibility for interaction review, better-colors for palette checks, and code-review for final changes. Read each selected skill through the available Skill tool or its SKILL.md; no particular plugin, machine path, account or previous chat state is required. Do not install optional tools merely to match the original environment.

## 2. Technical approval before scaffolding

Delivery: one locally served, presenter-controlled frontend with sample personas, simulated checkout and locally persisted interactions. No backend or cross-device synchronization is required.

If no app exists, propose the smallest suitable framework and exact dependencies, compact directory structure, asset-loading method, local state/file persistence and verification commands. Explain meaningful additions. Obtain approval before installation/scaffolding; this prompt is not approval of an unspecified stack.

Keep this preflight short and concrete. Do not restart concept discovery or introduce deferred systems. Once the technical plan is approved, carry PLAN.md through implementation, verification and corrections.

## 3. Build the agreed slices

Follow PLAN.md: real catalogue/detail/download first, then bookmarks/reviews/profiles, then local publishing/adaptation.

Use a small sample catalogue with permitted files and fictional metadata. Show sources, BOW version/reference, classroom requirements, required/optional attachments and honest permissions. Preserve editable downloads where supplied/authorized; teachers edit in external software.

Use PROJECT_MEMORY.md's review and counter definitions. Stars are ratings only. One editable review per demo persona/resource; prevent demo self-rating; show counts/unrated states. Contributor mean uses underlying reviews, not resource means. Sample counts/reviews are labelled. Genuine teacher feedback must remain separate.

Simulated personas/acquisition are explicit; collect no passwords or financial details and make no verified-buyer claim. A demo acquisition can unlock the review interaction; client-side controls are not secure authorization.

Local uploads, publish/hold and credited adaptations must change real prototype state if presented as functional. Persist file bytes if claiming reload persistence. Preserve original files and parent credit. Demo reviewer actions show workflow, not expert review or institutional affiliation.

Keep CJ's supplied palette, responsive layouts, keyboard use, clear errors and recovery. The memory records measured color limitations; verify rendered states. Prioritize the primary journey over decorative screens.

## 4. Protect demonstration-only materials

Teacher permission covers the demonstration only, with aliases. Keep files/previews/permission details in Git-ignored demo-assets/. Preserve originals and sanitize document content/metadata. Confirm modification permission before editing a teacher file; use a fictional team-created adaptation if needed.

Exclude teacher files and identifying metadata from Git, public hosting, external processing and publicly shared builds. Confirm submission sharing complies with permissions. Mock accounts/payment do not protect publicly exposed files.

There are no confirmed institutional partners/funders. No fabricated badges, teacher endorsements, expert reviews, adoption or workload/learning improvements.

Secure accounts, payments/payouts, public uploads/backend services, private revision merging, ads/subscriptions, offline website/editor and nationwide expansion remain deferred. Consequential changes need team approval.

The user authorized publication of this documentation batch. That authorization does not extend to future implementation commits/pushes, deployment or optional tool installation. Respect the prohibition on AI-generated pitch decks and mentor-created deliverables.

## 5. Verify and hand back

Add proportionate checks for nontrivial rating/count/state logic, especially uneven review counts, review edits, bookmark toggles and reset. Exercise DEMO.md's primary journey, file failures, persistence, role/payment simulations, contrast and responsive layouts in a browser when available.

Run relevant type/build checks; inspect final diff and Git state. Reassess against scope and correct in-scope defects. Update README with actual verified commands; record test environment, results, limitations and real/mock boundaries. Never check off unexecuted tests.

Preserve a runnable local demo and disclosed fallback. If a checkpoint slips, present a concrete P0 reduction for approval instead of silently replacing behavior with hard-coded success.

Finish with what works, what was tested, what is simulated and what remains blocked.
