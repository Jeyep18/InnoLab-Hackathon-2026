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
- The team agreed to the revised prototype direction. On October 26 the user explicitly authorized updating, committing and pushing this documentation/handoff batch so a partner can pull it. Framework/dependencies remain unselected; installation, scaffolding, deployment and future implementation commits/pushes require their applicable approval.

## Evidence and product direction

Reported interviews describe preparation workload, varied learner needs, resource access friction, classroom constraints and unreliable internet. Follow-up answers about the dominant effort, actual grade/subject/BOW and representative lesson files are still being gathered. Expected interview answers are hypotheses, not confirmed findings.

Team-approved direction: teacher-contributed lesson packs, searchable by curriculum reference and classroom context, with sources, permissions, contributor credit and adaptations. Existing tools overlap this model. The opportunity is easier discovery and reuse in the local teaching workflow, not inventing teacher-resource sharing.

> For Bicol public-school teachers who struggle to prepare curriculum-aligned lessons, CherIt helps them find, download and adapt reusable lesson packs matched to their Budget of Work and classroom resources, so they can prepare lessons from an existing foundation while preserving contributors' credit.

No workload reduction, literacy improvement, adoption, institutional partnership or funding has been measured or confirmed.

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

- No application, package manifest, installed project dependencies or working demonstration exists in the inspected checkout.
- Recommended architecture: locally served frontend, sample personas/catalogue, browser-local interaction persistence, permitted local files. Framework and exact dependencies require technical approval before installation/scaffolding.
- Pending: exact deadline; sample file locations/formats; starter grade/subject/BOW; modification permission; actual reviewer availability; approved technical stack.
- Public marketplace, real authentication/payments, nationwide scope, full offline editing and automatic institutional maintenance are superseded/deferred.
- Previous repository initialization/publication was separately authorized. This documentation batch is also authorized for commit/push; inspect actual Git state for publication status rather than assuming this text proves a successful push.
- Earlier setup observed Git, Node/npm and Python availability; recheck the actual environment during technical preflight rather than treating this as framework selection.
- This revision used better-colors for measured palette checks, writing-for-agents for the handoff, and a scoped read-only reviewer. No skill or dependency was installed.
- Research and limitations: [RESEARCH_TEACHER_RESOURCE_TOOLS.md](RESEARCH_TEACHER_RESOURCE_TOOLS.md). It is context, not the implementation contract.
- Use [IMPLEMENTATION_PROMPT.md](IMPLEMENTATION_PROMPT.md) in the coding conversation. Record actual milestones and test evidence only.
