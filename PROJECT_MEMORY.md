# Project memory

Updated: 2026-10-25 (Asia/Manila).

## Confirmed context
- Working project name: InnoLab Hackathon 2026; product name is undecided.
- Repository: https://github.com/Jeyep18/InnoLab-Hackathon-2026 (private at inspection).
- Team: JP (technical lead), CJ (design and creative lead), Francis (product and development lead). These responsibilities are proposed and flexible.
- Event dates: October 26–27, 2026; approximately two days and one night. Exact start time, submission deadline and presentation duration remain unknown.
- Theme/challenge will be revealed on the day; no product idea is selected.
- AI-assistance guidelines have not yet been provided; user will share updates. Permission and pre-event preparation rules remain unconfirmed.
- Current constraints: free-tier API access only; prefer lightweight technologies. Demo devices are one Windows laptop and one Mac laptop; internet is available, reliability untested. No other strict constraints identified yet.
- Objective: a small, technically credible, visually compelling MVP with one convincing, repeatable demonstration.
- User authorized repository initialization, persistent memory, suitable skills, and focused subagent assistance. Product implementation requires a separate approved direction.
- Three teams are participating and one event mentor is shared among them, per the team's mentoring brief. Francis expects to be the primary presenter; this is a current plan, not a fixed assignment.
- A separate AI mentor conversation handles product strategy, critique, pitch and judging preparation. The coding conversation owns technical implementation, tests and GitHub. Approved decisions must be recorded here for both workflows; recommendations alone do not change scope.

## Current state
- Phase: initialization and requirements discovery.
- The initially empty workspace now contains a clone of the existing empty GitHub repository, on main with origin configured.
- Documentation and a stack-neutral secret/local-file ignore policy were published to private GitHub main in initial commit c1fb8af. Verify the latest Git state before assuming it is still current.
- No source code, package manifest, framework, dependencies, database, service configuration, deployment, or CI exists.
- Real functionality: none. Mocked functionality: none. Product features: not yet defined. Application verification: not applicable yet.

## Decisions and approval gates
| Item | Status |
| --- | --- |
| Lightweight repository instructions and project memory | Authorized; initialized locally |
| Problem statement, target users, product concept and differentiator | Unknown; approval required |
| Primary demo journey and P0/P1/P2 boundaries | Unknown; approval required |
| Technology stack, architecture and dependencies | Unselected; approval required |
| Real versus mocked components and sample data | Undecided; approve with MVP |
| APIs and technology weight | Free-tier APIs only; lightweight technologies preferred; no stack selected |
| Deployment and external services | Unselected; no setup authorized |
| License | Unselected; do not add automatically |
| Initial documentation commit and push | Authorized and completed; origin/main matched local c1fb8af at verification |

## Required context / blockers
1. Await day-of theme; obtain judging rubric, AI/pre-event rules, exact times, submission deadline and deliverables.
2. Brainstorm product ideas after the theme is revealed; identify target user, problem, existing alternatives and demo outcome.
3. Confirm team technology familiarity, usable free-tier services, mandated technologies and demo network reliability.

Do not infer eligibility rules from the event name. Do not choose a stack from general preferences alone. Ask for service availability, never secret values in chat.

## Proposed scope guardrails
Prioritize one P0 user journey and its distinguishing capability. Defer authentication, billing, admin tools, complex persistence, realtime collaboration, native mobile apps and production infrastructure unless the core journey justifies them. These are guardrails, not an approved product feature list.

## Tooling and skills inventory
- Verified locally: Git 2.53.0.windows.1, Node.js v24.14.0, npm 11.9.0, Python 3.14.3. These are availability observations, not selected project requirements.
- GitHub CLI, Codex and a pnpm command are discoverable; pnpm execution and project compatibility are not verified. Claude Code and Bun are not on PATH; availability elsewhere is unknown.
- GitHub connector successfully inspected repository metadata. Figma, Canva, browser automation, Supabase and Vercel tools are exposed; project-specific access and configuration remain unverified.
- Used: ponytail (minimal coherent scope), writing-for-agents (portable brainstorming instructions); one read-only initialization reviewer.
- Available candidates, load only when relevant: frontend-design (approved UI creation), web-design-guidelines (UI/accessibility review), vercel:react-best-practices (only if React is selected), research (targeted evidence), code-review (final change review).
- The requested grill-me name is not in the current catalog; grilling is available, but focused questions suffice at this stage. No skill installation is needed.
- Claude-specific instructions are deferred because Claude Code was not found on PATH. If adopted, add a small CLAUDE.md importing @AGENTS.md instead of duplicating instructions.

## Next actions
Use [BRAINSTORM_PROMPT.md](BRAINSTORM_PROMPT.md) with the team or another AI when the theme arrives. The prompt supports ideation, constructive critique, feasibility comparison and an approval-ready decision brief. Collect remaining context, assess the concept, compare only genuinely suitable stack options, then present a concrete MVP and implementation plan for approval. Maintain [PLAN.md](PLAN.md) and [DEMO.md](DEMO.md) as decisions become known.
