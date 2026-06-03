---
name: ddd-typescript-implementation
description: Use when implementing DDD domain models, value objects, aggregates, domain events, repository ports, or domain tests in TypeScript.
---

# DDD TypeScript Implementation

## Purpose

Use this skill while writing TypeScript domain code. The domain layer should express business behavior and remain runnable without NestJS, Prisma, HTTP, queues, or generated database types.

## Layer Rules

- Domain code may import other domain code and stable language utilities.
- Domain code must not import `@nestjs/*`, `@prisma/client`, controllers, DTOs, config modules, queues, or database clients.
- Application code coordinates use cases and transactions.
- Infrastructure code implements ports and performs mapping.
- Presentation code translates transport input into application commands.

## Implementation Pattern

1. Start with a behavior test against a domain object or application use case.
   Before writing domain tests, read `references/domain-testing.md`.
2. Add value objects for values with validation, formatting, comparison, or calculations.
   For IDs or constrained primitives, read `references/branded-types.md`.
3. Put state transitions behind named methods.
4. Keep constructors private or narrow when invalid states are easy to create.
5. Return explicit domain errors or results consistently with the project.
   Before adding error shapes, read `references/domain-errors.md`.
6. Expose domain events without publishing them from the entity itself.

## Example

```ts
export class Order {
  private constructor(
    public readonly id: OrderId,
    private status: OrderStatus,
    private readonly events: DomainEvent[],
  ) {}

  static place(input: PlaceOrderInput): Result<Order> {
    if (input.lines.length === 0) {
      return err({
        type: "OrderRequiresLine",
        orderId: input.id,
      });
    }

    return ok(
      new Order(input.id, "PLACED", [
        { type: "OrderPlaced", orderId: input.id, occurredAt: input.placedAt },
      ]),
    );
  }

  cancel(input: CancelOrderInput): Result<void> {
    if (this.status === "SHIPPED") {
      return err({
        type: "ShippedOrderCannotBeCanceled",
        orderId: this.id,
      });
    }

    this.status = "CANCELED";
    this.events.push({
      type: "OrderCanceled",
      orderId: this.id,
      occurredAt: input.canceledAt,
    });

    return ok(undefined);
  }

  pullEvents(): DomainEvent[] {
    return this.events.splice(0);
  }
}
```

Use project-specific typed results or exceptions consistently; this example uses `Result`.

## Repository Ports

Name repository methods after aggregate needs:

- `findById(orderId)`
- `add(order)` for new aggregates when creation and update semantics differ
- `save(order)`
- `nextIdentity()`

Avoid leaking persistence mechanics:

- `findManyWithInclude()`
- `upsertPrismaData()`
- `queryBuilder()`

## Common Mistakes

- Using Prisma generated types as entities.
- Adding decorators to domain classes for validation, routing, injection, or persistence.
- Letting DTO names become domain language.
- Creating services that only forward calls to an anemic entity.
- Testing domain behavior through HTTP when a direct domain test would be clearer.

## Pressure Table

| Pressure | Correct Response |
| --- | --- |
| "Use the Prisma type to avoid duplication." | Keep a domain type and map at the adapter boundary. |
| "A string ID is fine." | Use branded IDs when two identifiers can be confused. |
| "Just throw a generic Error." | Use the project's typed domain error or result shape. |
| "Test through the controller." | Prefer a domain or application behavior test first. |
