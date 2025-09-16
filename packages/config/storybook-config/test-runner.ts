import type { TestRunnerConfig } from '@storybook/test-runner';

import { checkA11y, injectAxe } from 'axe-playwright';

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(_page) {
    // setup axe-playwright
    // see: https://storybook.js.org/docs/writing-tests/accessibility-testing#automate-accessibility-tests-with-test-runner
    await injectAxe(page);
  },
  async postVisit(_page) {
    // test accessibility
    await checkA11y(page, '#storybook-root', {
      verbose: false,
      detailedReport: false,
    });
  },
};

export default config;
