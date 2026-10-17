import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FilterProps } from '../Filter';

import { useState } from 'react';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import Filter, { filters as f } from '..';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

/** Controlled filter fixture retaining changes from its edit and remove actions */
const FilterExample = ({
  onChange,
  values: initialValues,
  ...props
}: FilterProps) => {
  const [values, setValues] = useState(initialValues);

  // retain submitted values for the next interaction
  const handleChange: FilterProps['onChange'] = (nextValues) => {
    onChange(nextValues);
    setValues(nextValues);
  };

  return <Filter {...props} onChange={handleChange} values={values} />;
};

const meta: Meta<typeof Filter> = {
  title: 'megapixels/Filter/Interactions',
  component: Filter,
  render: (args, { canvasElement }) => {
    return (
      <FilterExample
        {...args}
        disableAnimation
        portalContainer={canvasElement}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof Filter>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const EditAndRemove: Story = {
  args: {
    config: {
      filters: [
        f.checkboxes({
          name: 'status',
          config: {
            text: 'Status',
            options: [{ label: 'Delivered', value: 'delivered' }],
          },
        }),
      ],
    },
    onChange: fn(),
    values: { filter: { status: ['delivered'] } },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const edit = await canvas.findByRole('button', {
      name: 'Open status filter',
    });
    const remove = canvas.getByRole('button', { name: 'close chip' });

    await expect(edit).not.toContainElement(remove);
    await expect(remove).not.toContainElement(edit);

    edit.focus();
    await userEvent.keyboard('{Enter}');
    await expect(await canvas.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
      await expect(edit).toHaveFocus();
    });

    remove.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(async () => {
      await expect(
        canvas.queryByRole('button', { name: 'Open status filter' }),
      ).not.toBeInTheDocument();
    });
    await expect(args.onChange).toHaveBeenCalled();
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
