---
name: ddd-process-and-read-models
description: Use when TypeScript DDD work involves cross-aggregate workflows, eventual consistency, process managers, compensation, idempotency, read models, query services, or CQRS-lite.
---

# DDD Process And Read Models

## Purpose

Use this skill when one aggregate is not enough, or when reads are pressuring repositories to expose persistence-shaped queries. The goal is to coordinate without inflating aggregates or leaking database concerns into the domain.

## When To Use

- A use case updates more than one aggregate.
- A workflow continues after a domain event.
- A failed later step needs compensation or retry.
- A screen needs joined, filtered, or paginated data.
- A repository is about to grow `findMany`, `include`, or reporting methods.

Before implementing process state, idempotency, compensation, or read-model projection code, read `references/process-implementation.md`. For NestJS/Prisma transaction or outbox code, also use `ddd-nestjs-prisma` and its transaction/outbox reference.

## Process Coordination

- Keep aggregate invariants inside one aggregate.
- Put multi-step coordination in an application service or process manager.
- Store process state when retries, time gaps, or external systems are involved.
- Make handlers idempotent with event IDs, process IDs, or business keys.
- Use compensation when earlier successful work must be balanced after a later failure.
- Publish or persist follow-up work only after the triggering state change is durable.

## Read Models

- Use query services or read models for read-heavy screens.
- Return DTOs or view records, not aggregates, from read-side code.
- Keep read models outside domain behavior.
- Let read models denormalize when the read contract benefits from it.
- Do not add read-only graph loading to aggregate repositories.

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "Just update both aggregates in one method." | Keep each aggregate rule local; coordinate from application/process code. |
| "The page needs many joins, so expand the aggregate." | Add a read model or query service. |
| "The event handler can run twice; it is unlikely." | Add an idempotency key before publishing side effects. |
| "Put the workflow in the controller." | Controllers translate requests; process code owns workflow progress. |

## Output

Return:

- Aggregate boundaries that remain unchanged.
- Process manager or application coordination responsibilities.
- Events, retries, compensation, and idempotency decisions.
- Read model or query service shape for read-only needs.
- Tests needed for process progress and read contracts.
