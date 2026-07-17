# List all available make targets
list:
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/(^|\n)# Files(\n|$$)/,/(^|\n)# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | grep -E -v -e '^[^[:alnum:]]' -e '^$@$$'

# Clean up repository (remove node_modules, dist, build artifacts, etc.)
clean:
	sh ./scripts/cleanup-repository.sh;

# Install dependencies, set up pnpm, node version, husky and build all packages
# see: https://pnpm.io/installation#on-posix-systems
# see: https://pnpm.io/cli/runtime
install:
	# setup pnpm
	PNPM_VERSION=$$(grep packageManager package.json | cut -d'"' -f4 | cut -d'@' -f2) && echo "Setting up pnpm v$$PNPM_VERSION..."; \
		pnpm --help > /dev/null 2>&1 || curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=$$PNPM_VERSION sh -; \
		if [ "$$(pnpm --version)" != "$$PNPM_VERSION" ]; then pnpm self-update "$$PNPM_VERSION"; fi
	# setup node version
	NODE_VERSION=$$(cat .nvmrc) && echo "Setting up node v$$NODE_VERSION..."; \
		pnpm runtime set node --global $$NODE_VERSION;
	# install node modules
	pnpm install --ignore-scripts;
	# setup husky
	pnpm husky;
	# build all packages
	pnpm build;

# Start Storybook development server (installs dependencies first)
storybook: install
	pnpm --filter storybook-config storybook;

# Run react-scan on local Storybook for performance analysis
storybook-react-scan:
	pnpx react-scan@latest http://localhost:6006

# Run all tests (installs dependencies first)
test: install
	clear;
	pnpm test;

# Run the declaration-emit smoke test (installs dependencies first).
# `install` already runs `pnpm build`, so dist/index.d.ts is fresh
# by the time tsc reads it. See: packages/veto/test/dts-smoke/.
test-dts: install
	clear;
	pnpm --filter @fuf-stack/veto test:dts;

# Bootstrap or update the 'next' prerelease branch
# Creates .release-please-manifest-next.json with major version bumps
# Re-run this when main catches up to next's major version
bootstrap-next:
	sh ./scripts/bootstrap-next-branch.sh;
