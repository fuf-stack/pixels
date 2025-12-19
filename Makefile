# list available targets
list:
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/(^|\n)# Files(\n|$$)/,/(^|\n)# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | grep -E -v -e '^[^[:alnum:]]' -e '^$@$$'

clean:
	sh ./scripts/cleanup-repository.sh;

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

storybook:
	@$(MAKE) install;
	pnpm --filter storybook-config storybook;

storybook-react-scan:
	pnpx react-scan@latest http://localhost:6006

test:
	@$(MAKE) install;
	pnpm test;
