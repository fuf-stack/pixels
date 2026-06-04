import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import { array, object, refineObject, string, veto } from '@fuf-stack/veto';

// eslint-disable-next-line import-x/no-named-default
import { default as Form } from '../Form';
import Checkboxes from './Checkboxes';
import * as stories from './Checkboxes.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Checkboxes array error rendering', () => {
  it('renders nested index errors for checkbox groups', async () => {
    const validation = veto(
      refineObject(
        object({
          flavors: array(string()),
        }),
      )({
        custom: (_, ctx) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Select at least one flavor',
            path: ['flavors', '0'],
          });
        },
      }),
    );

    render(
      <Form
        initialValues={{ flavors: ['vanilla'] }}
        onSubmit={() => {}}
        testId="form"
        validation={validation}
      >
        <Checkboxes
          label="Flavors"
          name="flavors"
          options={[{ label: 'Vanilla', value: 'vanilla' }]}
        />
        <button data-testid="submit" type="submit">
          Submit
        </button>
      </Form>,
    );

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('flavors_error')).toContainHTML(
        'Select at least one flavor',
      );
    });
  });
});
