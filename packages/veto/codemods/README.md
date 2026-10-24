# Veto codemods

Use the [veto v1 upgrade codemod](v1-upgrade/README.md) for the current public
API. It preserves legacy type aliases and flags schema traversal logic that
requires manual migration. The experimental Zod v4 codemod previously on next
has been superseded by this tested implementation.
