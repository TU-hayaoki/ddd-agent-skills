# DDD Agent Skills

Clean-room skills for AI coding agents that design, implement, and review TypeScript systems with strict Domain-Driven Design.

This repository is aimed at projects using TypeScript, NestJS, and Prisma. It gives Codex, Claude Code, Cursor, OpenCode, and similar agents a shared DDD playbook without binding the application to one agent runtime.

## What This Repository Provides

- Strategic design guidance for subdomains, bounded contexts, and context maps.
- Tactical modeling guidance for aggregates, entities, value objects, domain services, and domain events.
- TypeScript implementation guidance for domain models that stay independent from framework and persistence code.
- NestJS and Prisma guidance for keeping adapters, transactions, repositories, and mappers at the edge.
- Process and read-model guidance for cross-aggregate workflows, eventual consistency, and query-heavy use cases.
- Architecture review guidance for finding DDD boundary drift before it becomes expensive.

## Repository Layout

```txt
docs/       Human-facing philosophy, integration notes, clean-room policy, validation scenarios
skills/     Reusable agent skills with local references for runtime recipes
agents/     Longer role prompts for focused agent behavior
templates/  Markdown templates for domain discovery and design records
rules/      Example static-analysis configurations for DDD boundaries
```

## Skills

| Skill | Use When |
| --- | --- |
| `ddd-strategic-design` | Exploring product language, subdomains, bounded contexts, or context maps. |
| `ddd-tactical-modeling` | Designing aggregates, value objects, entities, domain events, and invariants. |
| `ddd-typescript-implementation` | Implementing domain model code in TypeScript. |
| `ddd-nestjs-prisma` | Connecting NestJS and Prisma to a DDD domain model. |
| `ddd-process-and-read-models` | Handling cross-aggregate workflows, process managers, read models, and CQRS-lite. |
| `ddd-architecture-review` | Reviewing code for DDD boundary violations and model erosion. |

Some skills include `references/` files. Those files are intentionally colocated with the skill so a copied or symlinked skill remains usable without the rest of this repository. Read the referenced file when the skill says it is required for the task at hand.

Top-level `templates/` files are copyable starters for a target project. Skill runtime instructions should refer to the target project's living docs, not to these templates as active records.

## Using With Agents

Copy or symlink the needed `skills/*` directories into the skill location supported by your agent, or reference this repository from your project instructions. For focused work, also paste one of the prompts from `agents/` into a dedicated agent session.

Example instruction:

```txt
Use the ddd-tactical-modeling and ddd-typescript-implementation skills.
Model the Order context before changing code.
Keep domain code independent from NestJS, Prisma, HTTP, and database schemas.
```

## OpenSpec And Superpowers

This repository is designed to sit beside two other workflows:

- OpenSpec records the requested change, acceptance criteria, and design decisions.
- Superpowers supplies planning, TDD, debugging, and verification discipline.
- These skills supply DDD-specific judgment for strategy, modeling, implementation, and review.

See `docs/open-spec-superpowers-integration.md` for the recommended sequence.

## Clean-Room Policy

All text, templates, examples, and configs in this repository are original. The repository does not copy wording, examples, or structure from existing OSS skill/plugin repositories or from DDD books and articles. DDD ideas are expressed here as practical engineering guidance for TypeScript, NestJS, and Prisma.

See `docs/clean-room-policy.md` before contributing.

## License

MIT. See `LICENSE`.
