# Reference Snippet Type-Check

CI-only. This directory is a **typed mirror** of the TypeScript snippets embedded in the skill
files (`skills/**/references/*.md` and `skills/ddd-typescript-implementation/SKILL.md`). It exists
so `tsc --noEmit` can catch type drift in the documented examples.

The main repository intentionally ships no `package.json` or dependencies. The CI workflow installs
TypeScript ephemerally and runs `tsc -p .github/type-check/tsconfig.json`; nothing is vendored here.

## Maintenance contract

When you change a TypeScript snippet in a skill or reference file, update the matching mirror file
so the check stays faithful:

| Mirror file | Source snippet |
| --- | --- |
| `src/domain.ts` | unified domain types (branded-types.md, domain-errors.md, SKILL.md `Order`) |
| `src/order-literal.ts` | SKILL.md / domain-errors.md `place()` / `cancel()` (literal 3-arg form) |
| `src/branded.ts` | branded-types.md (asserts the documented "Type error" with `@ts-expect-error`) |
| `src/mapper-repo.ts` | prisma-mappers.md mapper + `add` / `save` / `findById` adapter |
| `src/tx-outbox.ts` | transactions-and-outbox.md interactive transaction |
| `src/process.ts` | process-implementation.md handler + projection |
| `src/testing.ts` | domain-testing.md tests + `FakeOrderRepository` |
| `src/prisma-stub.ts` | hand-written Prisma stub (no `@prisma/client`) |

The mirror is faithful but not auto-generated: snippets are illustrative fragments that reference
symbols defined elsewhere, so they are stitched together here with small stubs rather than extracted
verbatim.

## Run locally

```sh
npm install -g typescript@5.9.3
tsc --noEmit -p .github/type-check/tsconfig.json
```
