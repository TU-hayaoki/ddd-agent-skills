// Replace these example context names with the target repository's real bounded contexts.
const boundedContexts = ["orders", "billing", "catalog"];
const internalLayers = "(domain|application|infrastructure|presentation)";

const crossContextRules = boundedContexts.map((context) => {
  const otherContexts = boundedContexts.filter((candidate) => candidate !== context);

  return {
    name: `${context}-no-cross-context-internals`,
    severity: "error",
    comment: "Bounded contexts should communicate through public contracts, not internal modules.",
    from: { path: `^src/${context}/${internalLayers}` },
    to: { path: `^src/(${otherContexts.join("|")})/${internalLayers}` },
  };
});

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-no-framework-or-persistence",
      severity: "error",
      comment: "Domain code must not depend on NestJS, Prisma, transport, or infrastructure adapters.",
      from: { path: "^src/[^/]+/domain" },
      to: {
        path: [
          "^src/[^/]+/(infrastructure|presentation)",
          "^src/(shared/)?infrastructure",
          "node_modules/@nestjs/",
          "node_modules/@prisma/client",
        ],
      },
    },
    {
      name: "application-no-presentation",
      severity: "error",
      comment: "Application services coordinate use cases without depending on controllers or DTO transport code.",
      from: { path: "^src/[^/]+/application" },
      to: { path: "^src/[^/]+/presentation" },
    },
    {
      name: "infrastructure-no-presentation",
      severity: "warn",
      comment: "Infrastructure adapters should not know HTTP/controller concerns.",
      from: { path: "^src/[^/]+/infrastructure" },
      to: { path: "^src/[^/]+/presentation" },
    },
    ...crossContextRules,
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
