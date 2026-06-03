// EXACT reproduction of branded-types.md, asserting the "// Type error" claim.
declare const brand: unique symbol;

export type Brand<TValue, TName extends string> = TValue & {
  readonly [brand]: TName;
};

export type OrderId = Brand<string, "OrderId">;
export type CustomerId = Brand<string, "CustomerId">;

type OrderIdParseResult =
  | { ok: true; value: OrderId }
  | { ok: false; error: { type: "InvalidOrderId"; value: string } };

export function parseOrderId(value: string): OrderIdParseResult {
  if (value.length === 0) {
    return {
      ok: false,
      error: { type: "InvalidOrderId", value },
    };
  }

  return {
    ok: true,
    value: value as OrderId,
  };
}

declare const orderRepository: { findById(id: OrderId): Promise<unknown> };
function loadOrder(id: OrderId): Promise<unknown> {
  return orderRepository.findById(id);
}

const customer = "cus_123" as CustomerId;
// @ts-expect-error  branded-types.md asserts this line is a Type error
loadOrder(customer);

void parseOrderId;
