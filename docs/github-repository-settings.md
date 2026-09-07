# GitHub repository settings

Workflows and review instructions are versioned in the repository. The remaining
security and Copilot controls are GitHub-hosted settings and must be enabled by a
repository administrator.

## Required settings

- Create an active branch ruleset for `main` and `next`. Require the `Test`,
  `Dependency review`, and `Analyze JavaScript and TypeScript` checks and require
  pull requests before merging.
- In that ruleset, enable **Automatically request Copilot code review**. Leave
  draft reviews disabled so the first automatic review occurs when a pull
  request leaves draft. Decide separately whether every new push needs review.
- Under Code security, enable secret scanning, push protection, Dependabot
  alerts/security updates, and Copilot Autofix for CodeQL alerts where the plan
  supports it.
- Keep Actions permissions read-only by default. Do not send write tokens or
  repository secrets to workflows from forks.
- In npm trusted publishing, restrict each package to this repository and the
  `release-please.yml` workflow. Keep GitHub environment protection rules where
  package ownership requires approval. Published attestations must show npm
  provenance from that workflow.

Revisit this checklist when default branches, release workflows, package names,
or organization security policy change.
