# Process And Read-Model Implementation

Read this before implementing a process manager, idempotent event handler, compensation step, or read-model projection.

## Process State

Persist process state when work spans events, retries, time, or external systems.

```ts
type CancellationProcessState = {
  processId: string;
  orderId: OrderId;
  lastHandledEventId: string | null;
  step: "REFUND_PENDING" | "SHIPMENT_PENDING" | "COMPLETED" | "FAILED";
  retryCount: number;
};
```

Store enough state to answer:

- Which business object is being coordinated?
- Which event or command was already handled?
- Which step is next?
- Which failure can be retried or compensated?

## Idempotent Handler

```ts
async function handleOrderCanceled(event: OrderCanceled): Promise<void> {
  await unitOfWork.transaction(async (tx) => {
    const process = CancellationProcess.start({
      processId: processIdFrom(event),
      orderId: event.orderId,
      firstEventId: event.eventId,
    });

    const created = await tx.processes.tryAddFromEvent({
      process,
      eventId: event.eventId,
    });

    if (!created) {
      return;
    }

    await tx.outbox.add({
      type: "RequestRefund",
      dedupeKey: `refund:${process.id}`,
      payload: {
        orderId: event.orderId,
        processId: process.id,
      },
    });
  });
}
```

Back `tryAddFromEvent` with a unique constraint on `eventId` or `processId`; translate unique-conflict errors into `created=false`. Store process state and follow-up command records in the same transaction, then dispatch the outbox after commit.

## Compensation

Use compensation when a later step fails after earlier domain work succeeded. Compensation is another explicit domain or application action; it is not a rollback of history.

Record:

- The completed step.
- The failed step.
- The compensating command.
- Whether compensation is retryable.

## Read-Model Projection

```ts
async function projectOrderCanceled(event: OrderCanceled): Promise<void> {
  await readModels.cancellationDashboard.upsert({
    orderId: event.orderId,
    status: "CANCELED",
    canceledAt: event.occurredAt,
  });
}
```

Guidelines:

- Read models return view records, not aggregates.
- Projection handlers must tolerate duplicate events.
- Query services may join and paginate for screens.
- Aggregate repositories should not grow reporting methods.
