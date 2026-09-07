---
applyTo: '.github/**/*.{yml,yaml}'
---

Review workflow changes with least privilege. Fork pull requests must not receive
secrets or write tokens. Pin actions to intentional major versions, avoid runtime
package downloads where workspace-pinned tools exist, preserve trusted npm
publishing through OIDC, and ensure untrusted pull-request code cannot reach a
privileged `pull_request_target` context.
