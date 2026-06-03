// EXACT reproduction of the Order place()/cancel() from
// ddd-typescript-implementation/SKILL.md and domain-errors.md (3-arg constructor).
import { Result, ok, err, DomainEvent, OrderId } from "./domain";

type OrderStatus = "PLACED" | "CANCELED" | "SHIPPED";
type PlaceOrderInput = { id: OrderId; lines: unknown[]; placedAt: Date };
type CancelOrderInput = { reason: string; canceledAt: Date };

export class Order {
  private constructor(
    public readonly id: OrderId,
    private status: OrderStatus,
    private readonly events: DomainEvent[],
  ) {}

  static place(input: PlaceOrderInput): Result<Order> {
    if (input.lines.length === 0) {
      return err({ type: "OrderRequiresLine", orderId: input.id });
    }
    return ok(
      new Order(input.id, "PLACED", [
        { type: "OrderPlaced", orderId: input.id, occurredAt: input.placedAt },
      ]),
    );
  }

  cancel(input: CancelOrderInput): Result<void> {
    if (this.status === "SHIPPED") {
      return err({ type: "ShippedOrderCannotBeCanceled", orderId: this.id });
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
