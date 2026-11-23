# Changelog

Repository tooling and workflow changes are recorded here. Package release notes
remain in each package's generated changelog.

## 2026-11-19

### Changed

- Use vitest-config v6.1.0 to select GitHub coverage reporting automatically.
  Keep a single workspace preset import while preserving CI script tests,
  workflow summaries and the LCOV artifact consumed by SonarQube.
