# Context Relationship Choices

Use this reference when a design crosses bounded contexts. Pick a relationship explicitly instead of saying two contexts "integrate."

## Choices

| Relationship | Use When | Risk |
| --- | --- | --- |
| Anti-corruption adapter | A downstream context must protect its language from an upstream model. | Translation code can become a hidden rule layer. |
| Published language | Multiple consumers need a stable contract vocabulary. | Contract drift hurts many teams at once. |
| Open host service | One context provides a service endpoint for several consumers. | The host may become too generic. |
| Customer-supplier | A downstream team can influence the upstream contract. | Delivery coordination must be explicit. |
| Conformist | The downstream context accepts the upstream model as-is. | Local language may become weaker. |
| Shared kernel | Two contexts share a small model fragment by agreement. | Changes require joint discipline. |
| Separate ways | Contexts do not integrate directly. | Users or operations may need manual reconciliation. |

## Selection Questions

- Which context owns the rule behind the data?
- Does the downstream context need its own language?
- Who can change the contract without permission?
- What breaks if the upstream model changes shape?
- Is shared code cheaper than translation, including future coordination cost?

## Output

Record:

- Chosen relationship.
- Direction of dependency or contract ownership.
- Translation location.
- Shared terms and terms that must stay separate.
- Open questions that block a stable contract.
