# Agent instructions

## Mission and source of truth
Help JP, CJ, and Francis build the smallest technically credible, polished, repeatable hackathon MVP within approximately two days and one night. Humans retain product and architecture authority.

Read [PROJECT_MEMORY.md](PROJECT_MEMORY.md) first, then the relevant sections of [PLAN.md](PLAN.md) and [DEMO.md](DEMO.md). PROJECT_MEMORY.md records decisions; PLAN.md records execution; this file governs agent behavior. Respect confirmed competition rules. Surface conflicts between rules, user instructions, and approved plans before consequential work.

## Execution boundaries
- Inspect relevant code, then carry out requested work. Resolve routine design and implementation choices autonomously within the user's scope.
- Use the existing stack and installed dependencies. Ask only when missing information blocks the work or an action exceeds the user's authorization.
- Preserve user changes and shared history. Commit, push and deploy only when explicitly requested.

## UI components
- Use shadcn/ui's Base UI variants for every UI element they support, including buttons, inputs, menus, popovers, selects, checkboxes, tabs and dialogs. Compose local wrappers under `src/components/ui/`; build custom UI only where shadcn has no suitable component.
- New and modified controls use Base UI variants. Migrate existing Radix controls when touching them, preserving their behavior and accessibility. Use the official Base UI registry and current documentation, not Radix examples.
- Keep rendering separate from state orchestration. Keep each frontend component under 150 lines.

## Build and verify
- Prioritize correctness, maintainability, readability, security, and demo reliability. Prefer existing utilities, platform capabilities, and installed dependencies over new code or services.
- Classify features P0 (essential), P1 (valuable), P2 (optional), or Future (deferred). Build P0 as complete, testable vertical slices before peripheral polish.
- Do not add authentication, payments, databases, dashboards, analytics, infrastructure, or abstractions without a demonstrated MVP need.
- Keep secrets out of source, logs, chat, and browser bundles. Validate trust boundaries and preserve error handling. Prefer synthetic demo data.
- Respect CJ's approved visual direction. Preserve accessibility, responsive layouts, and loading, empty, error, and recovery states.
- Test changed behavior proportionally: important logic, primary journey, repeatability, service failure, and relevant UI states. Review the final diff and reassess against the original goal and approved plan.
- Clearly separate real, mocked, planned, implemented-but-unverified, and verified behavior. Never imply a static output or simulated identity is a working AI integration or secure authentication system.
- Maintain a runnable app after foundation setup. Freeze nonessential features near the deadline and rehearse a disclosed fallback.

## Collaboration and continuity
- Proposed roles: JP technical lead/integration; CJ design/creative; Francis product, development support, QA and presentation. Confirm concrete ownership before parallel edits.
- Prefer a stable main branch and short-lived feat/ or fix/ branches. Keep concurrent work in separate branches/worktrees with explicit file ownership.
- Use relevant installed skills progressively; name those actually used. Do not install optional tools without approval.
- Use narrowly scoped, preferably read-only subagents only when they improve outcomes. Verify conclusions, avoid redundant reviews, and stop completed agents. Subagents cannot expand approved scope.
- Search targeted sections; avoid repeated file reads, large logs, speculative implementations, and unnecessary documentation.
- Update project memory on meaningful decisions or milestones, with proposed/approved/implemented/deferred status. Do not invent decisions or progress. Keep machine-specific paths and account details out of shared project documentation.
- The separate mentor conversation advises on product scope, UX, pitch, and judging; this repository/coding workflow owns technical implementation and GitHub. A mentor recommendation becomes an implementation requirement only after the team approves it and it is recorded in PROJECT_MEMORY.md and PLAN.md. Share concise handoffs rather than assuming chats or agents share context.
- Finish with completed work, actual verification, limitations, and the next action. Explain concepts plainly when mentoring.
