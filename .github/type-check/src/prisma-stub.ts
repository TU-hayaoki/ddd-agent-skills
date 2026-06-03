// Minimal hand-written Prisma stub (no @prisma/client dependency).

export type OrderRecord = {
  id: string;
  customerId: string;
  status: string;
  version: number;
  lines: Array<{ id: string; sku: string; quantity: number }>;
};

export namespace Prisma {
  export type TransactionClient = {
    order: {
      findUnique(args: {
        where: { id: string };
        include?: { lines: boolean };
      }): Promise<OrderRecord | null>;
      create(args: { data: unknown }): Promise<unknown>;
      updateMany(args: {
        where: { id: string; version: number };
        data: unknown;
      }): Promise<{ count: number }>;
    };
    orderLine: {
      deleteMany(args: { where: { orderId: string } }): Promise<unknown>;
      createMany(args: { data: unknown[] }): Promise<unknown>;
    };
  };
}
