import type { Story } from './FieldArray.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { array, string, veto } from '@fuf-stack/veto';

import Input from '../../Input';
import Select from '../../Select';
import FieldArray from '../FieldArray';
import {
  edgeCaseSelectOptions,
  edgeCaseTopLevelVsArrayValidation,
  meta as sharedMeta,
} from './FieldArray.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/FieldArray/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EdgeCaseFlatArrayValidationClears: Story = {
  name: 'Flat Array Validation Clears on Type',
  parameters: {
    edgeCaseDescription:
      'Typing a valid value clears that flat-array item’s error after debounce, without requiring blur or clearing other invalid items.',
    formProps: {
      validation: veto({
        tags: array(string().min(1)).min(1),
      }),
    },
  },
  args: {
    name: 'tags',
    label: 'Tags (type to clear error)',
    flat: true,
    testId: 'tags',
    children: ({ name }) => {
      return <Input label="Tag" name={name} testId={name} />;
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Add first element
    const addButton = canvas.getByTestId('tags_append_button');
    await userEvent.click(addButton);

    // Wait for element to appear
    await waitFor(() => {
      expect(canvas.getByTestId('tags_0')).toBeInTheDocument();
    });

    // Add second element
    await userEvent.click(addButton);

    // Wait for second element to appear
    await waitFor(() => {
      expect(canvas.getByTestId('tags_1')).toBeInTheDocument();
    });

    const firstInput = canvas.getByTestId('tags_0');
    const secondInput = canvas.getByTestId('tags_1');

    // Click first input then blur to trigger touched state
    await userEvent.click(firstInput);
    await userEvent.click(secondInput);

    // Now both fields should show errors (after blur triggers touched state)
    await waitFor(
      () => {
        expect(firstInput.getAttribute('aria-invalid')).toBe('true');
      },
      { timeout: 1000 },
    );

    // Click outside to blur second input
    await userEvent.click(addButton);

    await waitFor(
      () => {
        expect(secondInput.getAttribute('aria-invalid')).toBe('true');
      },
      { timeout: 1000 },
    );

    // Type in second field
    await userEvent.type(secondInput, 'valid-tag', { delay: 50 });

    // Wait for debounce (300ms) + validation trigger + re-render
    // The error on the second field should clear after typing valid content
    // Note: aria-invalid is either 'true' when invalid, or null/not present when valid
    await waitFor(
      () => {
        expect(secondInput.getAttribute('aria-invalid')).not.toBe('true');
      },
      { timeout: 1000 },
    );

    // First field should still have error (still empty)
    expect(firstInput.getAttribute('aria-invalid')).toBe('true');
  },
};

export const EdgeCaseTopLevelStringNotInArray: Story = {
  name: 'Top-Level String Not In Array',
  parameters: {
    edgeCaseDescription:
      'Changing a top-level value clears matching cross-field errors while preserving duplicate-array errors until the duplicates are fixed.',
    formProps: {
      validation: edgeCaseTopLevelVsArrayValidation,
      initialValues: {
        topLevelValue: '',
        arrayField: [''],
      },
    },
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-6">
        <Select
          label="Top-level value"
          name="topLevelValue"
          options={edgeCaseSelectOptions}
        />
        <FieldArray {...args} />
      </div>
    );
  },
  args: {
    name: 'arrayField',
    label: 'Unique Array Values',
    flat: true,
    testId: 'arrayfield',
    children: ({ name }) => {
      return (
        <Select label="Value" name={name} options={edgeCaseSelectOptions} />
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const selectOption = async (fieldTestId: string, optionValue: string) => {
      const dropdown = canvas.getByTestId(`${fieldTestId}_select_dropdown`)
        .parentElement as HTMLElement;
      await userEvent.click(dropdown, { delay: 100 });

      const option = body.getByTestId(
        `${fieldTestId}_select_option_${optionValue}`,
      ).firstChild as HTMLElement;
      await userEvent.click(option, { delay: 100 });
    };

    // Set top-level and first array value to same option -> custom conflict.
    await selectOption('toplevelvalue', 'alpha');
    await selectOption('arrayfield_0', 'alpha');

    // Add second element and set to same option -> duplicate + custom conflict.
    const appendButton = canvas.getByTestId('arrayfield_append_button');
    await userEvent.click(appendButton);

    await waitFor(() => {
      expect(
        canvas.getByTestId('arrayfield_1_select_dropdown'),
      ).toBeInTheDocument();
    });

    await selectOption('arrayfield_1', 'alpha');

    // Submit once so all errors are consistently visible regardless of touched state.
    const submitButton = canvas.getByTestId('form_submit_button');
    await userEvent.click(submitButton);

    await waitFor(() => {
      const firstError = canvas.getByTestId('arrayfield_0_error');
      const secondError = canvas.getByTestId('arrayfield_1_error');

      expect(firstError).toContainHTML(
        'Array values must be different from the top-level value',
      );
      expect(secondError).toContainHTML(
        'Array values must be different from the top-level value',
      );
      expect(secondError).toContainHTML('Element already exists');
    });

    // Change top-level to remove only cross-field custom conflict.
    await selectOption('toplevelvalue', 'beta');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(canvas.queryByTestId('arrayfield_0_error')).toBeNull();

      const secondError = canvas.getByTestId('arrayfield_1_error');
      expect(secondError).not.toContainHTML(
        'Array values must be different from the top-level value',
      );
      expect(secondError).toContainHTML('Element already exists');
    });

    // Change second array element to remove duplicate as well.
    await selectOption('arrayfield_1', 'gamma');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(canvas.queryByTestId('arrayfield_0_error')).toBeNull();
      expect(canvas.queryByTestId('arrayfield_1_error')).toBeNull();
      expect(canvas.queryByTestId('arrayfield_error')).toBeNull();
    });
  },
};
