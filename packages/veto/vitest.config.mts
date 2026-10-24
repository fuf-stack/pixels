
import { mergeConfig } from 'vitest/config';

import projectConfig from '@fuf-stack/vitest-config/project';

export default mergeConfig(projectConfig, {
  test: {
    clearMocks: true,
  },
});
