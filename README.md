# CherIt

CherIt ("Share it") is a Bicol-focused teacher resource-sharing demonstration for InnoLab Hackathon 2026. Teachers find lesson packs, inspect sources and classroom requirements, download materials and share credited adaptations. "Cher mo na" is the team's proposed tagline.

**Status:** revised product scope is recorded. No app exists in the inspected checkout; framework and dependencies need technical approval.

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

## Development

No install/run/build/test commands exist yet. Inspect the current checkout and approve the technical preflight before framework installation/scaffolding; add commands verified in the actual environment afterward.

The product mentor advises on scope/judging; the coding workflow owns implementation and verification. The user authorized committing/pushing this documentation batch. Future implementation commits/pushes, deployment and dependency/service installation retain their applicable approval boundaries.

Use [IMPLEMENTATION_PROMPT.md](IMPLEMENTATION_PROMPT.md) next. Confirm the actual deadline, source files and technical proposal. The earlier 12-16-hour estimate is historical; keep the final two hours for rehearsal/submission.

## Partner checkout

In an existing clone, inspect your working tree first. With no local work to reconcile, switch to main and pull with fast-forward only. If you have local changes or a different active implementation branch, preserve them and reconcile before integrating this documentation; do not reset or overwrite them.

```sh
git status --short --branch
git switch main
git pull --ff-only origin main
```

Then paste [START_IMPLEMENTATION.md](START_IMPLEMENTATION.md) into the coding agent. A separate handoff file is unnecessary: the master prompt includes partner bootstrap instructions and points to the current sources of truth.

Ignored teacher files are deliberately absent from Git. Obtain authorized local samples separately or use the explicitly fictional fallback described in the master prompt. Do not expect account connections, installed skills or assets from another person's computer.
