import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { userEvent } from 'storybook/test';

import {
  array,
  number,
  object,
  refineObject,
  string,
  veto,
} from '@fuf-stack/veto';

import Form from '../Form';
import Select from './Select';
import * as edgeCaseStories from './stories/Select.edge-cases.stories';
import * as stories from './stories/Select.stories';

// EdgeCaseFetchFallbackOutside causes DOM errors in snapshot tests due to
// react-select + React 19 incompatibility when rendering values not in options.
// The functionality is covered by the unit tests below instead.
const { EdgeCaseFetchFallbackOutside: _, ...snapshotStories } = edgeCaseStories;

describe('Story Snapshots', () => {
  // keep existing unit snapshot scenarios, composition interactions also run in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    NumberValues: stories.NumberValues,
    MultiSelect: stories.MultiSelect,
    MultiSelectInitialValue: stories.MultiSelectInitialValue,
    InitialValue: stories.InitialValue,
    Required: stories.Required,
    Invalid: stories.Invalid,
    Disabled: stories.Disabled,
    OptionDisabled: stories.OptionDisabled,
    Loading: stories.Loading,
    NoResults: stories.NoResults,
    TransformMultiSelectSorted: stories.TransformMultiSelectSorted,
    NoResultsCustomRenderer: stories.NoResultsCustomRenderer,
  });
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

describe('Select array error rendering', () => {
  it('renders nested index errors for multi-select fields', async () => {
    const validation = veto(
      refineObject(
        object({
          flavors: array(string()),
        }),
      )({
        custom: (_data, ctx) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Pick at least one valid flavor',
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
        <Select
          label="Flavors"
          multiSelect
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
        'Pick at least one valid flavor',
      );
    });
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

// -----------------------------------------------------------------------------
// Integration
// -----------------------------------------------------------------------------

const options = [
  { value: 0, label: 'Zero' },
  { value: 2, label: 'Two' },
];

describe('Owned React Select integration', () => {
  it('associates visible labels, required state, help and errors with the real input', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ choice: number() })}>
        <Select
          description="Pick a number"
          label="Choice"
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('combobox', { name: 'Choice' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining('Pick a number'),
    );
    const label = screen.getByText('Choice');
    expect(label).toHaveAttribute('for', input.id);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByTestId('choice_error');
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent ?? ''),
    );
    // Keep React Select's own announcements alongside the field description.
    expect(input.getAttribute('aria-describedby')).toContain('placeholder');
  });

  it('preserves numeric zero selection and optional clearing submission', async () => {
    const submit = vi.fn();
    render(
      <Form
        onSubmit={submit}
        validation={veto({ choice: number().optional() })}
      >
        <Select label="Choice" name="choice" options={options} />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('combobox', { name: 'Choice' });
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Zero' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: 0 });
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}{Backspace}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(submit.mock.calls[1][0]).toEqual({});
  });

  it('binds public container and icon slots while preserving multiselect values', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form
        initialValues={{ choice: [0, 2] }}
        onSubmit={submit}
        validation={veto({ choice: array(number()) })}
      >
        <Select
          className={{
            selectContainer: 'slot-container',
            multiValueContainer: 'slot-value',
            crossIcon: 'slot-cross',
            downChevron: 'slot-chevron',
          }}
          label="Choice"
          multiSelect
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(container.querySelector('.slot-container')).toBeInTheDocument();
    expect(container.querySelectorAll('.slot-value')).toHaveLength(2);
    expect(container.querySelector('.slot-cross')).toBeInTheDocument();
    expect(container.querySelector('.slot-chevron')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Zero' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: [2] });
  });

  it('gives repeated field names distinct control and announcement IDs', () => {
    render(
      <>
        <Form onSubmit={() => {}}>
          <Select label="First" name="choice" options={options} />
        </Form>
        <Form onSubmit={() => {}}>
          <Select label="Second" name="choice" options={options} />
        </Form>
      </>,
    );
    const first = screen.getByRole('combobox', { name: 'First' });
    const second = screen.getByRole('combobox', { name: 'Second' });
    expect(first.id).not.toBe(second.id);
    expect(first.getAttribute('aria-describedby')).not.toBe(
      second.getAttribute('aria-describedby'),
    );
  });
});
