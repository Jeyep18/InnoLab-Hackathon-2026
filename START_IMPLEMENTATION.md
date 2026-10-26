# Partner starter prompt

Paste the text below into your coding agent from the updated repository checkout.

---

You are the implementation agent for CherIt. Begin by inspecting the actual repository and Git state. Read PROJECT_MEMORY.md first, then AGENTS.md, README.md, PLAN.md and DEMO.md. After those files, read IMPLEMENTATION_PROMPT.md completely and use it as your execution handoff alongside the repository's source-of-truth documents.

Before coding, give a concise reconciliation: current app state, approved product scope, what is real versus simulated, demo-only file restrictions, missing inputs, and any meaningful conflict between the documents or current checkout. Do not restart product brainstorming or assume the prior chat, local assets, plugins or account connections are available.

Follow the master prompt's technical preflight. Reuse any suitable existing setup; otherwise propose the smallest suitable stack with exact dependencies, directory layout, local state/file handling and verification plan. Ask for approval before new scaffolding/installations. Product direction is approved; an unspecified technology stack is not.

Once the technical plan is approved, execute PLAN.md's vertical slices, verify against DEMO.md, correct in-scope defects, and record actual progress and test evidence. Keep accounts/payments simulated and teacher files local with aliases. Missing teacher files can be replaced by clearly fictional reusable sample files as the master prompt allows. Preserve teammate work; obtain separate authorization for future implementation commits/pushes or deployment.

Your first response should show the context you read and a concrete technical preflight or justified reuse of an already approved setup, not a claim that an unbuilt app works.
