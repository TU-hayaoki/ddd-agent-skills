# Domain Testing

Use this reference before writing tests for domain or application behavior. Superpowers TDD controls the red-green-refactor loop; this file helps choose the right DDD tests.

## Test Targets

| Target | Test |
| --- | --- |
| Value object | Accepts valid values and rejects invalid values. |
| Aggregate command | Changes state only when invariants allow it. |
| Rejected command | Returns or throws a typed domain error. |
| Domain event | Is recorded only after a successful state change. |
| Repository port | Has a fake or contract test that matches aggregate needs. |
| Process manager | Advances, retries, or ignores duplicates correctly. |

## Aggregate Test Example

```ts
it("rejects placing an order without lines", () => {
  const result = Order.place({
    id: orderId("ord_123"),
    customerId: customerId("cus_123"),
    lines: [],
    placedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  expect(result).toEqual({
    ok: false,
    error: {
      type: "OrderRequiresLine",
      orderId: orderId("ord_123"),
    },
  });
});

it("rejects cancellation after shipping", () => {
  const order = shippedOrder();

  const result = order.cancel({
    reason: "customer_request",
    canceledAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  expect(result).toEqual({
    ok: false,
    error: {
      type: "ShippedOrderCannotBeCanceled",
      orderId: order.id,
    },
  });
  expect(order.pullEvents()).toEqual([]);
});
```

## Fake Repository

```ts
export class FakeOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async add(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
}
```

## Guidelines

- Test domain behavior without NestJS modules when possible.
- Prefer rejected-action tests over only happy paths.
- Assert events after successful behavior and absence of events after rejection.
- Use fakes for application tests; use adapter tests for Prisma mapping.
- Mirror the repository contract in fakes, including separate `add` and `save` methods when creation and update are distinct.
- Keep HTTP tests for transport wiring and serialization, not core rules.
