// Reproduction of prisma-mappers.md (mapper + add/save/findById repository adapter).
import {
  Order,
  OrderLine,
  OrderRepository,
  OrderPersistence,
  OptimisticConcurrencyError,
  OrderId,
  orderId,
  customerId,
  orderStatus,
  orderLineId,
  sku,
  quantity,
} from "./domain";
import { Prisma, OrderRecord } from "./prisma-stub";

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
