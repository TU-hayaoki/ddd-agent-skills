---
name: ddd-strategic-design
description: Use when a TypeScript product change involves subdomains, bounded contexts, ubiquitous language, ownership boundaries, or integrations between business capabilities.
---

# DDD Strategic Design

## Purpose

Use this before code structure is decided. Strategic design finds the business boundary code should respect.

## Triggers

- A feature spans multiple business capabilities.
- The same term appears to mean different things to different users or teams.
- A data model is being proposed before domain language is clear.
- A cross-context integration, event, API, or shared package is being introduced.

## Workflow

1. Gather language from the request, existing docs, tests, API names, and code.
2. List candidate subdomains and classify them as core, supporting, or generic for this product.
3. Identify bounded contexts by language consistency, ownership, invariants, and integration needs.
4. Before naming new concepts, check the target project's living language notes, OpenSpec artifacts, or `CONTEXT.md`; record new or conflicting terms.
5. Build or update a context map for upstream/downstream relationships.
   If choosing an integration relationship, read `references/context-relationships.md`.
6. Name open questions that block model decisions.
7. Produce design notes in the target project's docs; use this repository's templates only as copyable starters.

## Explicit Decisions

| Decision | Signal |
| --- | --- |
| Subdomain | Describes a business capability, not a technical layer. |
| Bounded context | Terms and rules are consistent inside it. |
| Context boundary | Crossing it requires translation or a contract. |
| Shared concept | Stable enough to share without forcing one model everywhere. |
| Integration style | It matches coupling, latency, and ownership needs. |

## Heuristics

- Same noun, different rules: prefer separate contexts.
- Strong consistency across objects: inspect aggregate boundaries before joining contexts.
- Prisma schema first: step back and name the capability.
- Leaked upstream model: add translation.
- Vague term: record competing definitions.
- If a workflow crosses aggregates or a read need is driving model size, route to `ddd-process-and-read-models`.

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "We already have tables; use those boundaries." | Name the business capability and language before accepting table shape. |
| "Reuse one shared type for all contexts." | Check whether the same word has different rules before sharing. |
| "Just call the other module directly." | Choose an explicit context relationship and translation point. |
| "Skip language notes." | Record new terms or conflicts so later agents do not guess. |

## Output Shape

Return:

- Candidate subdomains and rationale.
- Bounded contexts with language notes.
- Context map relationships.
- Risks caused by unclear language or ownership.
- Recommended next DDD skill for tactical modeling or implementation.

## Avoid

- Treating folders, modules, or database schemas as bounded contexts by default.
- Collapsing different meanings into one shared type to reduce code.
- Inventing a context for every entity.
- Designing NestJS modules before domain boundaries are named.
