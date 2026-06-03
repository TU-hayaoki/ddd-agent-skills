# Repository Rules

## Repository

- Name:
- Aggregate:
- Bounded context:
- Interface location:
- Implementation location:

## Allowed Operations

| Operation | Domain Meaning | Notes |
| --- | --- | --- |
|  |  |  |

## Disallowed Leaks

| Leak | Why It Is Disallowed | Replacement |
| --- | --- | --- |
| Prisma generated type | Domain would depend on persistence shape. | Map to aggregate. |
| Query builder | Use case would know storage details. | Add intention-revealing method. |
| Include graph | Aggregate boundary would follow database relations. | Load only aggregate state. |

## Mapping Rules

- Record to domain:
- Domain to record:
- Version or concurrency mapping:
- Null handling:

## Transaction Rules

- Transaction owner:
- Operations in same transaction:
- Operations after commit:
