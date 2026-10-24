# Veto migration from Zod v3

The Zod v4 implementation is available in veto v1. Follow the maintained
[veto v1 upgrade guide](../../docs/veto-v1-upgrade.md) and the
[v1 upgrade codemod instructions](codemods/v1-upgrade/README.md).

The experimental next-branch migration notes are superseded by that guide.
Veto normalizes validation errors for compatibility; consumers should follow
its public API rather than translating raw Zod error fields directly.
