# Clean-Room Policy

This repository is written from first principles for TypeScript, NestJS, Prisma, and AI coding agents. It may use common DDD concepts, but the expression, examples, templates, and structure must be original.

## Prohibited Inputs

Do not copy or lightly rewrite:

- Existing OSS skill or plugin repositories.
- Existing `SKILL.md` files.
- DDD book or article paragraphs.
- Java, .NET, Quarkus, or other framework examples.
- Generated text that was asked to mimic a specific existing repository.

## Allowed Inputs

Contributors may use:

- Their own DDD experience.
- Publicly known terminology such as aggregate, bounded context, value object, and domain event.
- Project-specific code being reviewed, as long as examples added to this repository are rewritten generically.
- Tool documentation for syntax when writing example configs, without copying explanatory prose.

## Writing Rules

- Use original sentences.
- Prefer TypeScript, NestJS, and Prisma examples.
- Keep examples short and purpose-built.
- Do not quote DDD authorities.
- Do not preserve another repository's section order as a hidden template.
- Do not add long historical explanations when direct operating guidance is enough.
- Write all explanations of CQRS, process managers, sagas, domain errors, and context-map relationships in original wording.

## Contribution Checklist

Before adding or changing content, confirm:

- The text was authored for this repository.
- Any code sample is original and not ported from another framework.
- The content helps an agent make a DDD decision.
- The skill frontmatter describes when to use the skill, not the internal workflow.
- Any skill-local reference file uses original TypeScript, NestJS, or Prisma examples.
- No source-specific phrasing remains from research notes.

## Review Standard

Reviewers should reject changes that feel like copied structure, imported examples, or generic DDD summaries. The expected style is practical, agent-facing, and specific to TypeScript application work.
