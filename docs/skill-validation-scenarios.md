# Skill Validation Scenarios

Use these scenarios to test whether the skills change agent behavior under pressure. Run baseline prompts without the skill, then rerun with the target skill loaded. Record differences in decisions, omissions, and rationalizations.

## Strategic Design

Prompt:

```txt
We need a Subscription feature. Just add tables for plans, invoices, coupons, and entitlements across the existing app. Keep it quick.
```

Expected skill behavior:

- Separates billing, entitlement, and customer-facing subscription language.
- Asks whether the same terms mean different things in different areas.
- Proposes bounded context or subdomain decisions before table design.
- Does not let database convenience define the model.

## Tactical Modeling

Prompt:

```txt
Implement Order.cancel() by setting status to CANCELED. It should work for all orders.
```

Expected skill behavior:

- Identifies cancellation invariants and allowed states.
- Checks whether payment, shipment, or fulfillment rules affect the aggregate.
- Emits a past-tense domain event only after the state transition is valid.
- Avoids an anemic setter as the main behavior.

## TypeScript Implementation

Prompt:

```txt
Use Prisma's generated Order type as the domain entity so we do not duplicate fields.
```

Expected skill behavior:

- Rejects generated ORM types as domain entities.
- Creates explicit mapping at the persistence boundary.
- Keeps domain tests independent from Prisma and NestJS.
- Models rule-heavy primitives as value objects where useful.

## Branded IDs

Prompt:

```txt
OrderId and CustomerId are both strings. Pass them around as plain string to keep the code simple.
```

Expected skill behavior:

- Uses branded or nominal IDs when identifiers can be confused.
- Validates raw input at the boundary.
- Avoids inline casts outside a constructor or parser.
- Maps branded values to primitives only at persistence or transport boundaries.

## Domain Errors

Prompt:

```txt
If the order cannot be canceled, just throw new Error("bad order").
```

Expected skill behavior:

- Models the rejection as a typed domain error, project-specific exception, or result object.
- Distinguishes domain rejection from infrastructure failure.
- Translates the domain error at the presentation boundary.
- Tests the rejected action as a first-class behavior.

## Domain Tests

Prompt:

```txt
We can skip domain tests because the controller e2e test covers cancellation.
```

Expected skill behavior:

- Requires a focused domain or application test for the invariant.
- Tests rejected commands and absence of events after rejection.
- Uses fake repositories for application tests when persistence is not the subject.
- Reserves HTTP tests for transport wiring and serialization.

## NestJS And Prisma

Prompt:

```txt
Inject PrismaService into the Order aggregate so the aggregate can save itself.
```

Expected skill behavior:

- Keeps aggregates persistence-ignorant.
- Places Prisma usage in an infrastructure repository adapter.
- Coordinates transactions in application service or unit-of-work code.
- Maps records to aggregates before domain behavior is invoked.

## Prisma Mapping

Prompt:

```txt
Return the Prisma Order record from OrderRepository so the service can access included relations.
```

Expected skill behavior:

- Rejects Prisma records as repository port return values.
- Keeps include graphs inside the infrastructure adapter.
- Maps records into aggregates before application/domain behavior.
- Adds adapter tests for mapping and missing-record behavior.

## Outbox And Transactions

Prompt:

```txt
After saving the order, publish OrderCanceled directly from the aggregate method.
```

Expected skill behavior:

- Keeps publication outside the aggregate.
- Writes outbox entries in the same transaction when durable publication is required.
- Publishes after commit from a dispatcher or worker.
- Makes event dispatch idempotent.

## Process And Read Models

Prompt:

```txt
The order cancellation flow must update Order, Refund, Shipment, and show a joined cancellation dashboard. Put all of it in the Order aggregate.
```

Expected skill behavior:

- Keeps each aggregate boundary focused on its own invariants.
- Uses application coordination or a process manager for cross-aggregate progress.
- Defines idempotency, retry, and compensation decisions.
- Uses a read model or query service for the dashboard instead of aggregate repository joins.

## Architecture Review

Prompt:

```txt
Review this PR quickly. It passes tests, but domain imports from @nestjs/common and @prisma/client were added for convenience.
```

Expected skill behavior:

- Flags framework and persistence imports in domain as high-severity findings.
- Explains the behavioral risk, not only the folder rule.
- Recommends moving decorators, clients, and generated types to adapters.
- Calls out missing boundary tests or static rules if they are absent.

## Architecture Review Self-Test

Prompt:

```txt
Review this repository's Prisma mapper guidance. It adds isNew and markPersisted() to the aggregate so the repository knows whether to insert or update.
```

Expected skill behavior:

- Flags aggregate persistence state as infrastructure leakage.
- Recommends `add` for new aggregates and `save` for existing aggregates, or another repository-side decision.
- Keeps aggregates persistence-ignorant and behavior-focused.
- Checks whether parent and child writes are transaction-safe.

## Recording Results

For each run, capture:

- Prompt and loaded skill.
- Agent output summary.
- Boundary decisions made or missed.
- Whether the response changed implementation direction.
- Follow-up wording needed to close loopholes.
