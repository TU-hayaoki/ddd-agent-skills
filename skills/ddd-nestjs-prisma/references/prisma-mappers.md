# Prisma Mappers And Repository Adapters

Read this before implementing a Prisma repository for an aggregate. The adapter owns persistence shape and translation; the domain stays independent.

## Mapper Shape

```ts
type OrderRecord = {
  id: string;
  customerId: string;
  status: string;
  version: number;
  lines: Array<{
    id: string;
    sku: string;
    quantity: number;
  }>;
};

export class PrismaOrderMapper {
  toDomain(record: OrderRecord): Order {
    return Order.rehydrate({
      id: orderId(record.id),
      customerId: customerId(record.customerId),
      status: orderStatus(record.status),
      version: record.version,
      lines: record.lines.map((line) =>
        OrderLine.rehydrate({
          id: orderLineId(line.id),
          sku: sku(line.sku),
          quantity: quantity(line.quantity),
        }),
      ),
    });
  }

  toPersistence(order: Order): OrderPersistence {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      version: order.version,
      lines: order.lines.map((line) => ({
        id: line.id,
        sku: line.sku,
        quantity: line.quantity,
      })),
    };
  }
}
```

## Repository Adapter

Create write adapters with a Prisma transaction client when parent and child rows must commit together.

```ts
type OrderWriteClient = Prisma.TransactionClient;

export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private readonly tx: OrderWriteClient,
    private readonly mapper: PrismaOrderMapper,
  ) {}

  async findById(id: OrderId): Promise<Order | null> {
    const record = await this.tx.order.findUnique({
      where: { id },
      include: { lines: true },
    });

    return record ? this.mapper.toDomain(record) : null;
  }

  async add(order: Order): Promise<void> {
    const data = this.mapper.toPersistence(order);

    await this.tx.order.create({
      data: {
        id: data.id,
        customerId: data.customerId,
        status: data.status,
        version: data.version,
        lines: {
          create: data.lines.map((line) => ({
            id: line.id,
            sku: line.sku,
            quantity: line.quantity,
          })),
        },
      },
    });
  }

  async save(order: Order): Promise<void> {
    const data = this.mapper.toPersistence(order);

    const result = await this.tx.order.updateMany({
      where: {
        id: data.id,
        version: data.version,
      },
      data: {
        status: data.status,
        version: { increment: 1 },
      },
    });

    if (result.count !== 1) {
      throw new OptimisticConcurrencyError(data.id);
    }

    await this.replaceLinesForSimpleOwnedChildren(data);
  }

  private async replaceLinesForSimpleOwnedChildren(
    data: OrderPersistence,
  ): Promise<void> {
    await this.tx.orderLine.deleteMany({
      where: { orderId: data.id },
    });

    if (data.lines.length > 0) {
      await this.tx.orderLine.createMany({
        data: data.lines.map((line) => ({
          id: line.id,
          orderId: data.id,
          sku: line.sku,
          quantity: line.quantity,
        })),
      });
    }
  }
}
```

## Guidelines

- Never return Prisma records from repository ports.
- Keep `include` graphs inside adapter code.
- Use `add` for new aggregates and `save` for existing aggregates; do not put persistence flags on the aggregate.
- Keep the initial version policy consistent between the domain factory and mapper.
- Save child entities by explicit aggregate rules; the replace helper is only for children without external references or history.
- Use diff-based child persistence when child identity, audit history, or downstream references matter.
- Use version checks when concurrent writes can violate decisions.
- Construct write repositories with a transaction client so parent and child writes commit together.
- Use `findById` for load-mutate-save use cases; use query services or read models for screen reads.
- Add adapter tests for mapping, version checks, and missing records.
