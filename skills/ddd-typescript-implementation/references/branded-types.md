# Branded Types

Use branded types when structurally identical values must not be mixed. They are useful for IDs, constrained strings, money amounts, and units.

## Pattern

```ts
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
```

`OrderId` and `CustomerId` are both strings at runtime, but TypeScript treats them as different types.

## Use

```ts
function loadOrder(id: OrderId): Promise<Order | null> {
  return orderRepository.findById(id);
}

const customer = "cus_123" as CustomerId;
loadOrder(customer); // Type error
```

## Guidelines

- Create branded constructors or parsers at the boundary where raw input enters the domain.
- Use `parseXxx` for untrusted input; use total `xxx()` constructors only for trusted internal values, tests, fixtures, and rehydration.
- Keep brands in domain or shared kernel code, not Prisma generated types.
- Do not cast inline except inside the validating constructor.
- Use value objects instead when the value has several fields or rich behavior.
- Map branded values to primitives before persistence and back after loading.
