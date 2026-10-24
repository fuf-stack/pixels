import createConfig from '@fuf-stack/eslint-config-fuf/prettier';

export default createConfig({
  tailwindStylesheet: 'packages/config/tailwind-config/tailwind.css',
  workspacePackagePrefix: '@fuf-stack',
});
