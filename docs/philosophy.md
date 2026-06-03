# Philosophy

DDD is useful for agentic coding only when it changes the agent's decisions. The goal is not to decorate code with DDD names. The goal is to make the software's important business rules visible, testable, and protected from accidental framework decisions.

## Working Principles

1. Start from language, not tables.
   Domain terms should come from the business capability being modeled. Database columns, controller payloads, and ORM relations can inform the design, but they should not define it.

2. Keep the domain model independent.
   Domain code should not import NestJS, Prisma, HTTP types, queues, environment config, or generated database clients. A domain object should be usable in a unit test without bootstrapping an application.

3. Use bounded contexts to permit different meanings.
   The same word may carry different rules in different parts of the business. Treat that as a design signal, not as a naming problem to flatten away.

4. Aggregates protect consistency.
   An aggregate boundary is justified by invariants that must be checked together. Do not make aggregates large because the database has convenient joins.

5. Repositories are collection-like ports.
   Repository interfaces should speak in aggregate concepts and persistence intentions. They should not expose query builders, ORM entities, or transaction internals to domain code.

6. Events are facts, not commands.
   A domain event records something meaningful that already happened in the domain. Handlers may trigger follow-up work, but the event name should not describe the handler's desired action.

7. Application services coordinate; they do not become the domain.
   Use cases load aggregates, call domain behavior, persist changes, and publish effects. Business decisions should still live in domain objects or domain services.

8. Static rules are guardrails, not the model.
   Dependency rules catch drift, but they do not prove the model is correct. Use reviews and tests to check whether the code still reflects the domain.

## Design Bias For TypeScript Systems

- Prefer explicit factories or named constructors when valid state requires checks.
- Prefer value objects for measured, formatted, or rule-heavy concepts.
- Prefer readonly public state or query methods over mutation that bypasses behavior.
- Prefer small domain tests that exercise business behavior without NestJS modules.
- Prefer mapping functions between Prisma records and domain objects over sharing classes across layers.

## Anti-Goals

- Turning every noun into a class.
- Hiding simple CRUD behind ceremony when no domain rule exists.
- Using framework decorators inside the domain layer.
- Treating Prisma schema relations as aggregate boundaries.
- Treating DDD as a folder naming exercise.
