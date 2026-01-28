import { describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

// eslint-disable-next-line import-x/no-named-default
import { default as Form } from '../Form';
// eslint-disable-next-line import-x/no-named-default
import { default as Select } from './Select';
// eslint-disable-next-line import-x/no-namespace
import * as stories from './Select.stories';

// EdgeCaseFetchFallbackOutside causes DOM errors in snapshot tests due to
// react-select + React 19 incompatibility when rendering values not in options.
// The functionality is covered by the unit tests below instead.
const { EdgeCaseFetchFallbackOutside: _, ...snapshotStories } = stories;

describe('Story Snapshots', () => {
  storySnapshots(snapshotStories);
});

describe('Select fallback options', () => {
  const options = [
    { label: 'Chocolate', value: 'chocolate' },
    { label: 'Vanilla', value: 'vanilla' },
  ];

  it('displays value not in options using fallback', async () => {
    render(
      <Form
        initialValues={{ flavor: 'secret_flavor' }}
        onSubmit={() => {}}
        testId="form"
      >
        <Select label="Flavor" name="flavor" options={options} />
      </Form>,
    );

    // The fallback shows the raw value as label when not in options
    await waitFor(() => {
      expect(screen.getByText('secret_flavor')).toBeInTheDocument();
    });
  });

  it('displays selectedOptionFallback label when value not in options', async () => {
    render(
      <Form
        initialValues={{ flavor: 'secret_flavor' }}
        onSubmit={() => {}}
        testId="form"
      >
        <Select
          label="Flavor"
          name="flavor"
          options={options}
          selectedOptionFallback={{
            label: 'Secret Flavor',
            value: 'secret_flavor',
          }}
        />
      </Form>,
    );

    // The fallback prop provides a proper label
    await waitFor(() => {
      expect(screen.getByText('Secret Flavor')).toBeInTheDocument();
    });
  });

  it('prefers option from options list over selectedOptionFallback', async () => {
    render(
      <Form
        initialValues={{ flavor: 'chocolate' }}
        onSubmit={() => {}}
        testId="form"
      >
        <Select
          label="Flavor"
          name="flavor"
          options={options}
          selectedOptionFallback={{
            label: 'Wrong Label',
            value: 'chocolate',
          }}
        />
      </Form>,
    );

    // Should use the label from options, not the fallback
    await waitFor(() => {
      expect(screen.getByText('Chocolate')).toBeInTheDocument();
    });
    expect(screen.queryByText('Wrong Label')).not.toBeInTheDocument();
  });

  it('handles multi-select with some values not in options', async () => {
    render(
      <Form
        initialValues={{ flavors: ['chocolate', 'secret_flavor'] }}
        onSubmit={() => {}}
        testId="form"
      >
        <Select
          multiSelect
          label="Flavors"
          name="flavors"
          options={options}
          selectedOptionFallback={[
            { label: 'Secret Flavor', value: 'secret_flavor' },
          ]}
        />
      </Form>,
    );

    await waitFor(() => {
      // Chocolate from options
      expect(screen.getByText('Chocolate')).toBeInTheDocument();
      // Secret Flavor from fallback
      expect(screen.getByText('Secret Flavor')).toBeInTheDocument();
    });
  });
});
