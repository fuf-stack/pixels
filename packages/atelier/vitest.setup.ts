/* eslint-disable import-x/no-extraneous-dependencies */
import '@testing-library/jest-dom/vitest';

import { beforeEach } from 'vitest';

import { cleanup } from '@testing-library/react';

beforeEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
