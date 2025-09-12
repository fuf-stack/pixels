import createConfig from '@fuf-stack/eslint-config-fuf/prettier';

export default createConfig({
  tailwindConfig: 'packages/config/tailwind-config/tailwind.config.ts',
  workspacePackagePrefix: '@fuf-stack',
});
