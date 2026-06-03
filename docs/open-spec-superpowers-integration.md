# OpenSpec And Superpowers Integration

This repository fills the DDD gap between specification management and execution discipline.

## Recommended Flow

1. Capture the change in OpenSpec.
   Record the user-visible behavior, acceptance criteria, constraints, and affected capability.

2. Use `ddd-strategic-design` when the change touches language, ownership, context boundaries, or cross-team integration.
   Update the relevant design templates before planning code.

3. Use Superpowers planning to produce the implementation plan.
   The plan should name the bounded context, affected aggregate or service, ports, adapters, and tests.

4. Use `ddd-tactical-modeling` before implementing business behavior.
   Define invariants, commands, events, and state transitions.

5. Use `ddd-process-and-read-models` when the change needs cross-aggregate coordination or read-heavy queries.
   Prefer process managers, outbox-backed events, query services, or read models over oversized aggregates and read-oriented aggregate repositories.

6. Use Superpowers TDD for code changes.
   Write behavior tests against domain or application behavior before implementation.

7. Use `ddd-typescript-implementation` for pure domain code.
   Keep framework and persistence details outside the domain.

8. Use `ddd-nestjs-prisma` for adapters and persistence.
   Translate between domain objects and Prisma records explicitly.

9. Use `ddd-architecture-review` before completion.
   Check that the result matches the spec, the model, and the dependency boundaries.

## OpenSpec Artifacts To Link

- Change proposal or request.
- Accepted capability name.
- Bounded context decision.
- Aggregate design note.
- Integration contract or context-map entry.
- Process manager or read-model decision when consistency or query needs cross aggregates.
- Acceptance tests or examples.

## Superpowers Touchpoints

- Planning: include DDD boundaries and model decisions in the implementation plan.
- TDD: start with domain/application behavior tests.
- Debugging: distinguish broken business rules from adapter failures.
- Verification: run tests plus static boundary checks.

## Completion Criteria

A change is not done until:

- The OpenSpec change is satisfied.
- Domain language has been updated where the change introduced new terms.
- Business rules have tests at the lowest useful layer.
- NestJS, Prisma, and transport code remain outside the domain model.
- Architecture review findings are resolved or explicitly accepted.
