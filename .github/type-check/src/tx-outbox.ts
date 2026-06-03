// Reproduction of transactions-and-outbox.md interactive-transaction snippet.
import { DomainEvent, ok, err, OrderId } from "./domain";
import { Prisma } from "./prisma-stub";
import { PrismaOrderRepository, PrismaOrderMapper } from "./mapper-repo";

class PrismaOutbox {
  constructor(private readonly tx: Prisma.TransactionClient) {}
  async addAll(_events: DomainEvent[]): Promise<void> {
    void this.tx;
  }
}

declare const prisma: {
  $transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};
declare const mapper: PrismaOrderMapper;
declare const command: { orderId: OrderId; reason: string };
declare const clock: { now(): Date };

export const run = () =>
  prisma.$transaction(async (tx) => {
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
