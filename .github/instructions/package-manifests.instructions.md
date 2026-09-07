---
applyTo: '{package.json,pnpm-lock.yaml,packages/**/package.json,release-please*.json,.release-please-manifest*.json}'
---

Treat dependency and release edits as supply-chain changes. Verify exact pins,
workspace dependency direction, runtime versus peer dependency placement,
lockfile consistency, package export targets, and independent package versioning.
Release Please owns normal version and changelog updates. Published packages
must not expose `workspace:` ranges or private `@repo/*` tooling in tarballs.
