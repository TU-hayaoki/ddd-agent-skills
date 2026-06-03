---
name: ddd-architecture-review
description: Use when reviewing TypeScript, NestJS, or Prisma code for DDD boundary violations, anemic models, aggregate mistakes, or architecture drift.
---

# DDD Architecture Review

## Purpose

Use this skill as a review lens. Prioritize defects that can weaken the domain model, blur bounded contexts, or make business rules harder to change safely.

## Review Order

1. Confirm the intended bounded context and use case.
2. Check dependency direction from domain outward.
3. Inspect whether invariants live in domain behavior.
4. Verify persistence and transport mapping stay at boundaries.
5. Look for cross-context coupling.
6. Check whether read-heavy or cross-aggregate behavior should use `ddd-process-and-read-models`.
7. Check tests cover business behavior near the model.

## Severity Guide

| Severity | Examples |
| --- | --- |
| High | Domain imports NestJS or Prisma, aggregate cannot enforce invariant, cross-context write bypasses a contract. |
| Medium | Application service contains rule-heavy branching, repository leaks ORM records, event names describe handler commands. |
| Low | Naming drift, duplicated mapping code, missing template updates, unclear test names. |

## Finding Format

Lead with findings. For each finding include:

- Severity.
- File and line when available.
- The violated boundary or modeling rule.
- Why it creates maintenance or correctness risk.
- A concrete fix direction.

## Checklist

- Domain layer is free of framework, persistence, and transport imports.
- Aggregates expose behavior instead of public state mutation.
- Value objects protect rule-heavy values.
- Repositories speak in aggregate terms.
- Prisma generated types stop at infrastructure.
- Controllers and DTOs do not become the domain language by accident.
- Bounded contexts do not import each other's internals.
- Domain events are past-tense facts.
- Tests exercise domain/application behavior without unnecessary HTTP or database setup.

## Verification Gates

- Adapt `rules/dependency-cruiser/ddd-boundaries.example.js` to the target repo's actual bounded contexts before running it.
- Adapt `rules/eslint/boundaries.example.config.js` to the target repo's actual paths and context names before running it.
- Treat "example config exists" as insufficient; verify the configured rule matches real source paths.
- Use static checks as supporting evidence, not as a replacement for model review.

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "Tests pass, so boundary leaks are fine." | Report domain/framework/persistence leaks as architectural defects. |
| "The rule config exists." | Confirm it is adapted to the repo and catches real paths. |
| "Review only the changed controller." | Trace whether business rules moved out of the domain. |
| "This is just a read query." | Check for aggregate repository bloat and read-model alternatives. |

## Avoid

- Approving a change because tests pass while boundaries are broken.
- Recommending broad refactors when a small boundary fix is enough.
- Treating DDD terms as proof of DDD behavior.
- Ignoring unclear language because the code compiles.
