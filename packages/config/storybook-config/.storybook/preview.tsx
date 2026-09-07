import type { Preview } from '../preview';

import sharedPreview from '../preview';

// load tailwind css
import '@repo/tailwind-config/tailwind.css';

const preview: Preview = {
  ...sharedPreview,
};

export default preview;
