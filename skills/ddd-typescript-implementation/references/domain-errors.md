# Domain Errors

Use domain errors when invalid business actions need explicit handling. The goal is to make failure categories visible without turning every branch into framework code.

## Categories

| Category | Meaning | Example |
| --- | --- | --- |
| Invariant violation | A command would make the aggregate invalid. | Canceling a shipped order. |
| Invalid value | A value object cannot be constructed. | Empty order ID. |
| Missing aggregate | A required aggregate was not found. | Order ID does not exist. |
| Policy rejection | A domain policy rejects a valid command shape. | Credit limit exceeded. |

## Result Shape

```ts
export type DomainError =
  | { type: "OrderRequiresLine"; orderId: OrderId }
  | { type: "ShippedOrderCannotBeCanceled"; orderId: OrderId }
  | { type: "InvalidOrderId"; value: string }
  | { type: "OrderNotFound"; orderId: OrderId };

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <T = never>(error: DomainError): Result<T> => ({
  ok: false,
  error,
});
```

## Aggregate Example

```ts
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
```

## Guidelines

- Pick exceptions or results per project, then stay consistent.
- Prefer typed domain errors over generic message strings.
- Use creation factories for new aggregates; reserve `rehydrate` for restoring persisted state.
- Translate domain errors to HTTP, GraphQL, or queue responses at the presentation boundary.
- Keep infrastructure failures separate from domain rejections.
- Test rejected actions as first-class behavior.
