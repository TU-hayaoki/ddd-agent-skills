# Transactions And Outbox

Read this before implementing transaction boundaries, event publication, or outbox persistence.

## Transaction Boundary

Use the application use case as the default transaction boundary. The transaction should cover aggregate persistence and durable side-effect records that must commit together.

In Prisma interactive transactions, a normal callback return commits. Returning `err(...)` is not a rollback signal. The early returns below happen before writes; if a use case must stop after a write, throw an infrastructure-level transaction error or redesign the write order.

```ts
await prisma.$transaction(async (tx) => {
  const orders = new PrismaOrderRepository(tx, mapper);
  const outbox = new PrismaOutbox(tx);

  const order = await orders.findById(command.orderId);
  if (!order) {
    return err({ type: "OrderNotFound", orderId: command.orderId });
  }

  const result = order.cancel({
    reason: command.reason,
    canceledAt: clock.now(),
  });

  if (!result.ok) {
    return result;
  }

  await orders.save(order);
  await outbox.addAll(order.pullEvents());

  return ok(undefined);
});
```

## Outbox Rules

- Write outbox rows in the same transaction as the aggregate change.
- Include event ID, aggregate ID, event type, payload, occurred time, and publish state.
- Publish after commit from a worker or dispatcher.
- Make dispatch idempotent; a retry must not duplicate business effects.
- Do not publish directly from an aggregate.

## Process Manager Rules

- Store process state when a workflow spans time, retries, or external systems.
- Handle duplicate events by checking event ID or process step state.
- Use compensation actions when a later step fails after earlier work succeeded.
- Keep controller code out of process progress decisions.

## Review Questions

- What must commit atomically?
- Which effects can happen after commit?
- What happens if the handler runs twice?
- Where is process progress stored?
- How is failure observed and retried?
