import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, waitFor, within } from '@testing-library/react';

import Filter, { filters as f } from '.';
import * as stories from './Filter.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Coverage', () => {
  test('renders the add-filter menu into a custom portal container', async () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);

    const { getByTestId } = render(
      <Filter
        config={{
          filters: [
            f.checkboxes({
              name: 'status',
              config: {
                text: 'Status',
                options: [{ label: 'Delivered', value: 'delivered' }],
              },
            }),
          ],
        }}
        disableAnimation
        onChange={() => {}}
        portalContainer={portal}
        values={{}}
      />,
    );

    fireEvent.click(getByTestId('add_filter_button'));

    // The add-filter menu popover should render inside the provided container.
    await waitFor(() => {
      expect(
        within(portal).getByRole('menuitem', { name: /Status/ }),
      ).toBeInTheDocument();
    });

    portal.remove();
  });
});
