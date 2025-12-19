# List all available make targets
list:
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/(^|\n)# Files(\n|$$)/,/(^|\n)# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | grep -E -v -e '^[^[:alnum:]]' -e '^$@$$'

# Clean up repository (remove node_modules, dist, build artifacts, etc.)
clean:
	sh ./scripts/cleanup-repository.sh;

# Install dependencies, set up pnpm, and build all packages
install:
	# setup pnpm
	# see: https://pnpm.io/installation#on-posix-systems
	pnpm --help > /dev/null 2>&1 || curl -fsSL https://get.pnpm.io/install.sh | sh -;
	pnpm self-update $(shell grep '"packageManager": "pnpm@' package.json | sed 's/.*pnpm@\([^"]*\).*/\1/');
	# install node modules
	pnpm env use --global `cat .nvmrc`;
	pnpm install --ignore-scripts;
	pnpm husky install;
	# build packages
	pnpm build;

# Start Storybook development server (installs dependencies first)
storybook:
	@$(MAKE) install;
	pnpm --filter storybook-config storybook;

# Run react-scan on local Storybook for performance analysis
storybook-react-scan:
	pnpx react-scan@latest http://localhost:6006

# Run all tests (installs dependencies first)
test:
	@$(MAKE) install;
	pnpm test;

# Bootstrap or update the 'next' prerelease branch
# Creates .release-please-manifest-next.json with major version bumps
# Re-run this when main catches up to next's major version
bootstrap-next:
	sh ./scripts/bootstrap-next-branch.sh;
