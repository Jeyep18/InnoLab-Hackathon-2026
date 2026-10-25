# Roadmap

Status: initialization authorized; all product phases below are proposals, not approved implementation tasks. Event dates are October 26–27, 2026; exact times and build budgets await the detailed schedule. Use [BRAINSTORM_PROMPT.md](BRAINSTORM_PROMPT.md) for concept selection once the day-of theme is available.

| Phase | Priority / status | Proposed owner | Dependencies | Acceptance and verification |
| --- | --- | --- | --- | --- |
| 0. Repository and memory | P0 / initialized locally | Coordinating agent | Existing repository | Origin matches supplied URL; no history overwritten; documentation links and ignore behavior checked |
| 1. Requirements and concept review | P0 / blocked on context | Francis + team, agent assists | Theme, rubric, rules, concept, constraints | Approved problem, user, differentiator, one demo journey, P0 boundaries; assess alternatives and feasibility |
| 2. Stack and implementation plan | P0 / pending approval | JP + team | Approved concept | Compare only suitable options; approve architecture, dependencies, costs, real/mock boundary, file ownership and test strategy |
| 3. First vertical slice | P0 / not started | JP; CJ designs; Francis validates | Approved plan | App runs; input reaches a meaningful output through primary screens; important logic and states checked |
| 4. Essential capability | P0 / not started | JP + Francis with separate ownership | Working slice | Distinguishing capability operates genuinely where feasible; required integrations, validation and failure recovery checked |
| 5. Reliability and presentation | P0 / not started | Francis QA/demo; CJ polish; JP fixes | Complete core journey | Repeat journey from reset without repair; responsive/keyboard review; explicit service-failure behavior and fallback |
| 6. Freeze and submission | P0 / not started | Team | Rubric, stable verified build | Accurate README/demo/memory; final diff review; authorized stable commit; required submission artifacts; optional authorized deployment |

Before phase 3, replace generic product phases with approved, small tasks naming actual files/modules, required behavior, owner, dependencies, acceptance checks and risks. Do not invent module names before architecture selection.

## Collaboration proposal
Keep main demonstrable once an app exists. Use feat/<feature> and fix/<issue> branches for isolated work, integrating verified changes frequently. JP coordinates integration; CJ can design while Francis validates product assumptions. Parallel code work requires separate file ownership and branches/worktrees. Do not configure branch protection or CI without a justified approved need.

## Risks and fallback planning
- Unknown pre-event/AI rules: confirm eligibility before product work.
- Unknown concept and deadline: timebox one central journey after requirements arrive; drop P1/P2 first.
- Unverified external services: validate essential capability early after approval; design a clearly disclosed seeded/local/recorded fallback where appropriate.
- Merge conflicts: separate ownership and integrate frequently; preserve teammate work.
- Demo fragility: rehearse reset, repeated runs and expected failures; freeze optional work near the deadline.

## Definition of done
Approved MVP matches the original problem and rubric; the core value and user journey are verified; important errors and relevant security/accessibility concerns are addressed; real and mocked behavior is disclosed; repeatable demo and practical fallback are documented; final diff and documentation are reviewed; stable changes are committed when authorized; required submission items are satisfied. No readiness claim before these checks.
