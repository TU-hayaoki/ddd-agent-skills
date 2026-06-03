---
name: ddd-tactical-modeling
description: Use when designing or changing aggregates, entities, value objects, domain services, domain events, invariants, or state transitions in TypeScript.
---

# DDD Tactical Modeling

## Purpose

Use this skill to turn business rules into a small, testable domain model. Tactical design should protect invariants without making simple behavior ceremonial.

## Modeling Order

1. Name the command or business action.
2. Identify the rule that must hold before and after the action.
3. Choose the aggregate boundary that can enforce that rule.
4. Model identities, values, and lifecycle state.
5. Check the target project's language notes before introducing names; record new or conflicting terms.
6. Name domain events for meaningful facts that occurred.
7. Define repository needs in aggregate terms.
8. If the rule crosses aggregates or the need is mostly read-side, switch to `ddd-process-and-read-models`.

## Building Blocks

| Building Block | Use For | Avoid |
| --- | --- | --- |
| Entity | Stable identity with changing state. | Plain data bags with setters. |
| Value object | Meaningful value with validation or behavior. | Wrapping every primitive automatically. |
| Aggregate | Consistency boundary around rules. | Mirroring table graphs. |
| Domain service | Rule that belongs in the domain but not one entity. | Use-case orchestration or I/O. |
| Domain event | Fact the domain cares about after success. | Future-tense commands to handlers. |

## Aggregate Rules

- The aggregate root is the only public mutation entry point.
- Invariants must be checked inside the aggregate before state changes escape.
- Other aggregates are referenced by identity, not object graphs.
- Keep eventual consistency outside the aggregate boundary.
- Large read requirements do not justify large aggregates.

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "Set the status field directly." | Add or call a behavior method that enforces the transition. |
| "Load related aggregates into this one." | Reference other aggregates by identity and coordinate outside. |
| "The UI needs a big joined view." | Use a read model or query service, not a larger aggregate. |
| "Emit an event so a handler can do X." | Name the past-tense fact that happened in the domain. |

## TypeScript Shape

Prefer explicit behavior:

```ts
const order = Order.place({
  customerId,
  lines,
  placedAt: clock.now(),
});

order.cancel({ reason, canceledAt: clock.now() });
```

Avoid mutation that bypasses rules:

```ts
order.status = "CANCELED";
order.canceledAt = new Date();
```

## Event Naming

Use past-tense names that describe completed domain facts:

- `OrderPlaced`
- `OrderCanceled`
- `InvoicePaymentRecorded`

Do not name events after technical delivery or handler intent:

- `SendOrderEmail`
- `UpdateInvoiceProjection`

## Review Questions

- What invariant would break if this code were a plain CRUD update?
- Which object has enough information to reject an invalid command?
- Is this rule domain logic, application coordination, or infrastructure behavior?
- Can the model be tested without NestJS, Prisma, HTTP, or a database?
