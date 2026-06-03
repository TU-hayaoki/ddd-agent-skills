# Process Regression Test Design

These regression tests lock in the durability and idempotency guarantees described in
`skills/ddd-process-and-read-models/references/process-implementation.md`. They target the
example coordination handler, not a specific framework. Adapt the fakes to the project's
unit-of-work, process store, and outbox.

## Case 1: a duplicate event is a no-op

Idempotency must come from a unique key, not a read-then-act check.

- Given an `OrderCanceled` event with a fixed `eventId`.
- And a process store with a unique constraint on `eventId` (or `processId`).
- When the handler runs twice with the same event.
- Then the first run stores one process and writes exactly one follow-up outbox row.
- And the second run observes the existing key (`tryAddFromEvent` returns `false`) and writes nothing.

```ts
it("ignores a duplicate OrderCanceled event", async () => {
  const event = orderCanceled({ eventId: "evt_1" });

  await handleOrderCanceled(event);
  await handleOrderCanceled(event);

  expect(processStore.count()).toBe(1);
  expect(outbox.rowsFor("evt_1")).toHaveLength(1);
});
```

## Case 2: an outbox failure rolls back process state

Process state and follow-up records must commit together.

- Given `tryAddFromEvent` would succeed.
- And the outbox write throws inside the same unit-of-work transaction.
- When the handler runs.
- Then the transaction aborts and no process row and no outbox row are committed.
- And a later retry of the same event can start cleanly.

```ts
it("rolls back process state when the outbox write fails", async () => {
  outbox.failNext();

  await expect(
    handleOrderCanceled(orderCanceled({ eventId: "evt_2" })),
  ).rejects.toThrow();

  expect(processStore.count()).toBe(0);
  expect(outbox.rowsFor("evt_2")).toHaveLength(0);
});
```

## Notes

- Back the duplicate check with a database unique constraint; treat `tryAddFromEvent` as insert-or-noop.
- Keep process-state and outbox writes in one transaction so a later failure leaves no partial progress.
- Compensation is a separate forward action for already-committed work, not a rollback of domain history.
