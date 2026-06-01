import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import { object, refineObject, string, veto } from '@fuf-stack/veto';

// eslint-disable-next-line import-x/no-named-default
import { default as Form } from '../Form';
// eslint-disable-next-line import-x/no-named-default
import { default as Select } from './Select';
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
          label="Flavors"
          multiSelect
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

describe('Select required indicator', () => {
  it('renders required asterisk when field is required by schema', () => {
    const validation = veto({
      flavor: string(),
    });

    render(
      <Form onSubmit={() => {}} testId="form" validation={validation}>
        <Select
          label="Flavor"
          name="flavor"
          options={[{ label: 'Vanilla', value: 'vanilla' }]}
        />
      </Form>,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

describe('Select validation timing', () => {
  // Regression test for select timing:
  // verifies cross-field validation reacts to the current selection immediately,
  // not one render cycle later (which previously happened when blur/touched ran
  // before the new select value was fully committed).
  it('updates cross-field error immediately on select changes', async () => {
    const validation = veto(
      refineObject(
        object({
          additional: string(),
          primary: string(),
        }),
      )({
        custom: (data, ctx) => {
          if (
            typeof data.primary === 'string' &&
            typeof data.additional === 'string' &&
            data.primary === data.additional
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Additional must differ from primary',
              path: ['additional'],
            });
          }
        },
      }),
    );

    render(
      <Form
        initialValues={{ additional: 'beta', primary: 'alpha' }}
        onSubmit={() => {}}
        testId="form"
        validation={validation}
      >
        <Select
          label="Primary"
          name="primary"
          options={[
            { label: 'Alpha', value: 'alpha' },
            { label: 'Beta', value: 'beta' },
          ]}
        />
        <Select
          label="Additional"
          name="additional"
          options={[
            { label: 'Alpha', value: 'alpha' },
            { label: 'Beta', value: 'beta' },
          ]}
        />
        <button data-testid="submit" type="submit">
          Submit
        </button>
      </Form>,
    );

    // Start valid.
    expect(screen.queryByTestId('additional_error')).toBeNull();

    const additionalCombobox = screen.getByTestId('additional');
    fireEvent.keyDown(additionalCombobox, { key: 'ArrowDown', keyCode: 40 });

    const alphaOption = (
      await screen.findByTestId('additional_select_option_alpha')
    ).firstChild as HTMLElement;
    fireEvent.click(alphaOption);

    // Becomes invalid immediately after selecting the conflicting value.
    await waitFor(() => {
      expect(screen.getByTestId('additional_error')).toContainHTML(
        'Additional must differ from primary',
      );
    });

    fireEvent.keyDown(additionalCombobox, { key: 'ArrowDown', keyCode: 40 });
    const betaOption = screen.getByTestId('additional_select_option_beta')
      .firstChild as HTMLElement;
    fireEvent.click(betaOption);

    // Returns to valid immediately after selecting a valid value again.
    await waitFor(() => {
      expect(screen.queryByTestId('additional_error')).toBeNull();
    });
  });
});
