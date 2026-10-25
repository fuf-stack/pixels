import { expect, test } from 'vitest';

import getVisualTestImage from '../packages/config/storybook-config/visual/getVisualTestImage.mjs';

test('reads the selected job image rather than another job or a hardcoded pin', () => {
  expect(
    getVisualTestImage(`
jobs:
  lint:
    container:
      image: unrelated:1
  visual-tests:
    container:
      image: "registry.example/playwright:v2@sha256:abc" # pinned by CI
`),
  ).toBe('registry.example/playwright:v2@sha256:abc');
});

test('supports the container shorthand', () => {
  expect(
    getVisualTestImage('jobs:\n  visual-tests:\n    container: example:2\n'),
  ).toBe('example:2');
});

test.each([
  'jobs: {}',
  'jobs:\n  visual-tests:\n    container:\n      image: ""',
  'jobs:\n  visual-tests:\n    container:\n      image: ${{ matrix.image }}',
])('rejects unresolved image configuration: %s', (source) => {
  expect(() => getVisualTestImage(source)).toThrow('literal container image');
});
