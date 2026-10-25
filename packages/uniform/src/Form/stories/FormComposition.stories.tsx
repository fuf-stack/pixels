import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import FieldArray from '../../FieldArray';
import Grid from '../../Grid';
import Input from '../../Input';
import SubmitButton from '../../SubmitButton';
import Form from '../Form';

const meta: Meta = { title: 'uniform/Form/Composition' };
export default meta;
type Story = StoryObj;

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
const customText = 'text-small text-body text-danger';

const sample = (configured: boolean) => {
  return (
    <StylingProvider styling={styling}>
      <style>{'.text-body { font-size: 18px; }'}</style>
      <Form
        className={{
          base: 'max-w-lg',
          form: configured ? customText : undefined,
        }}
        debug={{ disable: true }}
        initialValues={{ people: [{ name: 'Ada' }] }}
        onSubmit={action('onSubmit')}
        testId="composition_form"
      >
        <Grid
          className={configured ? customText : undefined}
          testId="composition_grid"
        >
          <p>Contact details</p>
          <FieldArray
            className={
              configured
                ? { listItemInner: customText, elementFieldsGrid: customText }
                : undefined
            }
            label="People"
            name="people"
            sortable
          >
            {({ name }) => {
              return <Input label="Name" name={`${name}.name`} />;
            }}
          </FieldArray>
          <SubmitButton />
        </Grid>
      </Form>
    </StylingProvider>
  );
};

export const DefaultLayout: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="form"]' } },
  render: () => {
    return sample(false);
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Reorder item' }),
    ).toBeVisible();
  },
};

export const ConfiguredFormAndArray: Story = {
  render: () => {
    return sample(true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId('composition_form');
    const grid = canvas.getByTestId('composition_grid');
    const arrayGrid = canvas.getByTestId('people_0_element_fields_grid');
    await Promise.all(
      [form, grid, arrayGrid, arrayGrid.parentElement].map(async (element) => {
        await expect(element).toHaveClass('text-body', 'text-danger');
        await expect(element).not.toHaveClass('text-small');
        await expect(getComputedStyle(element as Element).fontSize).toBe(
          '18px',
        );
      }),
    );
  },
};
