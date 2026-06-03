// Unified faithful reproduction of the repo's domain snippets
// (branded-types.md constructors, domain-errors.md Result, SKILL.md Order behavior,
//  plus the richer accessors prisma-mappers.md assumes).
// The DomainError union mirrors domain-errors.md, including the OrderNotFound
// (missing-aggregate) variant used by transactions-and-outbox.md.

declare const brand: unique symbol;
export type Brand<TValue, TName extends string> = TValue & {
  readonly [brand]: TName;
};

export type OrderId = Brand<string, "OrderId">;
export type CustomerId = Brand<string, "CustomerId">;
export type OrderLineId = Brand<string, "OrderLineId">;
export type Sku = Brand<string, "Sku">;
export type Quantity = Brand<number, "Quantity">;
export type OrderStatus = "PLACED" | "CANCELED" | "SHIPPED";

// total constructors for trusted internal values / tests / fixtures / rehydration
export const orderId = (v: string): OrderId => v as OrderId;
export const customerId = (v: string): CustomerId => v as CustomerId;
export const orderLineId = (v: string): OrderLineId => v as OrderLineId;
export const sku = (v: string): Sku => v as Sku;
export const quantity = (v: number): Quantity => v as Quantity;
export const orderStatus = (v: string): OrderStatus => v as OrderStatus;

// domain-errors.md Result Shape
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

export type DomainEvent =
  | { type: "OrderPlaced"; orderId: OrderId; occurredAt: Date }
  | { type: "OrderCanceled"; orderId: OrderId; occurredAt: Date };

export class OrderLine {
  private constructor(
    public readonly id: OrderLineId,
    public readonly sku: Sku,
    public readonly quantity: Quantity,
  ) {}
  static rehydrate(input: { id: OrderLineId; sku: Sku; quantity: Quantity }): OrderLine {
    return new OrderLine(input.id, input.sku, input.quantity);
  }
}

export type PlaceOrderInput = {
  id: OrderId;
  customerId: CustomerId;
  lines: OrderLine[];
  placedAt: Date;
};
export type CancelOrderInput = { reason: string; canceledAt: Date };

export class Order {
  private constructor(
    public readonly id: OrderId,
    private _status: OrderStatus,
    private readonly _events: DomainEvent[],
    public readonly customerId: CustomerId,
    public readonly version: number,
    public readonly lines: readonly OrderLine[],
  ) {}

  get status(): OrderStatus {
    return this._status;
  }

  static place(input: PlaceOrderInput): Result<Order> {
    if (input.lines.length === 0) {
      return err({ type: "OrderRequiresLine", orderId: input.id });
    }
    return ok(
      new Order(
        input.id,
        "PLACED",
        [{ type: "OrderPlaced", orderId: input.id, occurredAt: input.placedAt }],
        input.customerId,
        1,
        input.lines,
      ),
    );
  }

  cancel(input: CancelOrderInput): Result<void> {
    if (this._status === "SHIPPED") {
      return err({ type: "ShippedOrderCannotBeCanceled", orderId: this.id });
    }
    this._status = "CANCELED";
    this._events.push({
      type: "OrderCanceled",
      orderId: this.id,
      occurredAt: input.canceledAt,
    });
    return ok(undefined);
  }

  pullEvents(): DomainEvent[] {
    return this._events.splice(0);
  }

  static rehydrate(input: {
    id: OrderId;
    customerId: CustomerId;
    status: OrderStatus;
    version: number;
    lines: OrderLine[];
  }): Order {
    return new Order(input.id, input.status, [], input.customerId, input.version, input.lines);
  }
}

export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

export type OrderPersistence = {
  id: OrderId;
  customerId: CustomerId;
  status: OrderStatus;
  version: number;
  lines: Array<{ id: OrderLineId; sku: Sku; quantity: Quantity }>;
};

export class OptimisticConcurrencyError extends Error {
  constructor(public readonly orderId: OrderId) {
    super(`optimistic concurrency: ${orderId}`);
  }
}
