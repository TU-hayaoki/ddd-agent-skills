// Reproduction of domain-testing.md (aggregate tests + FakeOrderRepository).
import { Order, OrderId, OrderRepository, orderId, customerId } from "./domain";

// minimal jest-like stubs (no @types/jest dependency)
declare function it(name: string, fn: () => void): void;
declare function expect(actual: unknown): { toEqual(expected: unknown): void };
declare function shippedOrder(): Order;

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

export class FakeOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
}
