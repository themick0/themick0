# Roles for Peter Mikheev's personal website

These instructions and starter prompts support work on the landing page. They do not launch agents automatically. Repository-wide rules are linked from [AGENTS.md](../../AGENTS.md) and apply to every role.

## Getting started

The current stage is maintenance of the Astro + TypeScript application and its Cosmos visual style. Application source lives in `src/`; check commands are in [package.json](../../package.json). Choose a role for the current task.

1. Read the [repository language rule](../rules/repository-language.md) and the [shared context](../context.md). When present, also read `ai/.context.local.md` from the repository root, following the handling rules in [AGENTS.md](../../AGENTS.md). The optional local file is excluded from Git and is not part of a public handoff.
2. Choose one role from the table and use its starter prompt.
3. Add a concrete task and available materials. Do not assign every stage at once.
4. Hand the result to the next role with decision statuses: approved, draft, or open question.

One agent can work through different roles sequentially. A separate reviewer can help provide an independent assessment; parallel work is optional.

| Order | Role | Main output |
| --- | --- | --- |
| 1 | [Positioning Strategist + Content Designer](01-positioning-content-designer.md) | Core message, minimal structure, English copy, and distribution of details |
| 2 | [Art Director + Product Designer](02-art-director-product-designer.md) | Visual concept, composition, interactions, and prototype specification |
| 3 | [Creative Frontend Engineer](03-creative-frontend-engineer.md) | Responsive HTML prototype, then production implementation after prototype evaluation |
| 4 | [Independent UX + Accessibility / QA Reviewer](04-ux-accessibility-qa-reviewer.md) | Prioritized findings, reproduction steps, and review limitations |

## Handoffs

Each role finishes with a short explanation of:

- What was prepared and where it lives.
- Which decisions the owner approved and which remain proposals.
- The facts supporting the result.
- What remains unknown and whether it blocks the next step.
- The specific task for the next role.

Do not create a separate document for every small question. The following are suggested formats, not a mandatory set of files:

- **Content brief:** audience, positioning, offer, facts, and message map.
- **Page copy:** home page text and content specifications for detail pages.
- **Design brief:** visual system, composition, and behavior.
- **Prototype / application:** implementation files and validation results.
- **Review:** prioritized findings and concrete fixes.

## Working rules

- Peter's latest instructions take precedence over earlier plans and these templates.
- All repository files, including briefs, role prompts, and review notes, must be in English.
- The current application preserves the Cosmos visual style; further changes follow Peter's current task.
- Moving to the next stage depends on the current task and authorization already given. Do not ask again for an approved decision.
- Local edits, publication, messaging, and changes to external services are separate actions. Creating a prototype does not authorize publication or sending messages.
- Do not change copy to simplify layout or add sections to fill space.
- Questions for the owner should affect a decision; look for known facts in the materials first.

## Example application maintenance prompt

```text
Read ai/context.md and ai/roles/03-creative-frontend-engineer.md.
Follow ai/rules/repository-language.md.
Make the requested change to the application in src/.
Preserve the approved copy and Cosmos design unless the task requires changes.
Check types, the build, and affected browser scenarios.
```
