---
name: ddd-nestjs-prisma
description: Use when connecting NestJS modules, providers, controllers, Prisma models, transactions, or persistence adapters to a DDD TypeScript domain model.
---

# DDD NestJS Prisma

## Purpose

Use this skill for the edge of the application. NestJS and Prisma are excellent adapter tools, but they should not define the domain model.

## Boundary Rules

- Controllers translate transport input into application commands.
- Application services orchestrate use cases, transactions, repositories, and event publication.
- Prisma repositories implement ports and map records to domain objects.
- Domain objects do not inject providers and do not save themselves.
- Prisma schema design may differ from aggregate structure.

## NestJS Module Shape

Keep modules aligned with bounded contexts or clear application capabilities. Inside a context, separate intent by layer:

```txt
orders/
  domain/
  application/
  infrastructure/
  presentation/
```

The NestJS module wires providers from the outside. It should not force decorators into domain classes.

## Prisma Adapter Pattern

Repository implementation responsibilities:

- Load records using Prisma.
- Convert records into domain objects.
- Persist aggregate state changes.
- Hide includes, transactions, and generated types from the domain.
- Preserve optimistic concurrency or version checks when the aggregate needs them.

Mapping code is not waste. It is the translation boundary that lets the domain model use business language.

Before implementing a Prisma repository or mapper, read `references/prisma-mappers.md`.

## Transactions

Use transactions around application use cases that must commit atomically. Keep transaction APIs out of domain objects.

Good location choices:

- Application service method.
- Unit-of-work abstraction.
- Repository adapter called by the application service.

Poor location choices:

- Aggregate method.
- Value object constructor.
- Domain event object.

Before implementing transactions, outbox persistence, or process-manager storage, read `references/transactions-and-outbox.md`.

## Domain Events

Collect events from aggregates during the use case. Publish only after persistence succeeds, unless the project has an explicit outbox design. When using an outbox, write outbox rows in the same transaction as aggregate persistence.

## Review Checklist

- Does domain code import NestJS or Prisma?
- Do controllers contain business decisions?
- Does a repository return aggregates instead of Prisma records?
- Are DTOs mapped into commands before domain behavior is called?
- Are cross-context calls translated through an API, event, or adapter?
- Does transaction scope match the business consistency requirement?

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "Inject PrismaService into the aggregate." | Keep Prisma in an infrastructure repository adapter. |
| "Return Prisma records from the port." | Map records to aggregates before crossing inward. |
| "Publish events inside the entity." | Collect events and publish after successful persistence. |
| "Put workflow state in a controller." | Use application/process code and durable state when needed. |
