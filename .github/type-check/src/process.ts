// Reproduction of process-implementation.md (idempotent handler + projection).
import { OrderId } from "./domain";

type OrderCanceled = {
  type: "OrderCanceled";
  orderId: OrderId;
  occurredAt: Date;
  eventId: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CancellationProcessState = {
  processId: string;
  orderId: OrderId;
  lastHandledEventId: string | null;
  step: "REFUND_PENDING" | "SHIPMENT_PENDING" | "COMPLETED" | "FAILED";
  retryCount: number;
};

class CancellationProcess {
  private constructor(public readonly id: string) {}
  static start(input: {
    processId: string;
    orderId: OrderId;
    firstEventId: string;
  }): CancellationProcess {
    return new CancellationProcess(input.processId);
  }
}

declare const processIdFrom: (event: OrderCanceled) => string;

type Tx = {
  processes: {
    tryAddFromEvent(a: { process: CancellationProcess; eventId: string }): Promise<boolean>;
  };
  outbox: {
    add(a: { type: string; dedupeKey: string; payload: unknown }): Promise<void>;
  };
};
declare const unitOfWork: {
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
};
declare const readModels: {
  cancellationDashboard: {
    upsert(v: { orderId: OrderId; status: string; canceledAt: Date }): Promise<void>;
  };
};

export async function handleOrderCanceled(event: OrderCanceled): Promise<void> {
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

export async function projectOrderCanceled(event: OrderCanceled): Promise<void> {
  await readModels.cancellationDashboard.upsert({
    orderId: event.orderId,
    status: "CANCELED",
    canceledAt: event.occurredAt,
  });
}

const _state: CancellationProcessState | null = null;
void _state;
