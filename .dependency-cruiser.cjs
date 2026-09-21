/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies cause hard-to-debug runtime initialization issues and tight coupling.',
      from: {
        path: '^src',
      },
      to: {
        circular: true,
      },
    },
    {
      name: 'ui-must-not-depend-on-pages',
      severity: 'error',
      comment:
        'Low-level UI components in src/components/ui must remain generic and never import from src/pages.',
      from: {
        path: '^src/components/ui',
      },
      to: {
        path: '^src/pages',
      },
    },
    {
      name: 'ui-must-not-depend-on-domain-features',
      severity: 'warn',
      comment:
        'Primitive UI design components should not depend directly on specific domain feature folders.',
      from: {
        path: '^src/components/ui',
      },
      to: {
        path: '^src/components/(host|properties|layout|chat|map)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.app.json',
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
