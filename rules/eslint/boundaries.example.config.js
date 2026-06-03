// Replace these example context names with the target repository's real bounded contexts.
const boundedContexts = ["orders", "billing", "catalog"];

const crossContextPatternsFor = (context) => {
  const otherContexts = boundedContexts.filter((candidate) => candidate !== context);

  return otherContexts.map((otherContext) => ({
    group: [
      `src/${otherContext}/domain/**`,
      `src/${otherContext}/application/**`,
      `src/${otherContext}/infrastructure/**`,
      `src/${otherContext}/presentation/**`,
    ],
    message: "Use contracts, events, or adapters instead of importing another bounded context's internals.",
  }));
};

const crossContextOverrides = boundedContexts.flatMap((context) => [
  {
    files: [`src/${context}/**/*.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: crossContextPatternsFor(context),
        },
      ],
    },
  },
  {
    files: [`src/${context}/domain/**/*.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...crossContextPatternsFor(context),
            {
              group: ["@nestjs/*", "@prisma/client"],
              message: "Domain code must not import framework or persistence packages.",
            },
          ],
        },
      ],
    },
  },
]);

module.exports = {
  plugins: ["boundaries"],
  settings: {
    "boundaries/elements": [
      { type: "domain", pattern: "src/*/domain/**" },
      { type: "application", pattern: "src/*/application/**" },
      { type: "infrastructure", pattern: "src/*/infrastructure/**" },
      { type: "presentation", pattern: "src/*/presentation/**" },
      { type: "contracts", pattern: "src/contracts/**" },
      { type: "shared", pattern: "src/shared/**" },
    ],
    "boundaries/ignore": ["**/*.spec.ts", "**/*.test.ts"],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            from: "domain",
            allow: ["domain", "shared"],
          },
          {
            from: "application",
            allow: ["domain", "application", "contracts", "shared"],
          },
          {
            from: "infrastructure",
            allow: ["domain", "application", "infrastructure", "contracts", "shared"],
          },
          {
            from: "presentation",
            allow: ["application", "contracts", "shared"],
          },
          {
            from: "contracts",
            allow: ["contracts", "shared"],
          },
          {
            from: "shared",
            allow: ["shared"],
          },
        ],
      },
    ],
  },
  overrides: crossContextOverrides,
};
