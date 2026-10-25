import type { Story } from './Select.storySetup';

import { useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, Card, Modal } from '@fuf-stack/pixels';

import Select from '../Select';
import {
  args,
  SelectWithFallbackFetch,
  meta as sharedMeta,
} from './Select.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/Select/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EdgeCaseMenuIsVisibleInCard: Story = {
  name: 'Menu Is Visible in Card',
  parameters: {
    edgeCaseDescription:
      'Opening a Select inside a card keeps its option menu visible rather than clipped by the card.',
  },
  args,
  render: (renderArgs) => {
    return (
      <Card header="Select in a Card">
        <Select {...renderArgs} />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });
    // The option portal is inserted before the menu transition finishes.
    // Wait for visibility so parallel browser workers do not race the animation.
    await waitFor(() => {
      expect(
        body.getByTestId('selectfield_select_option_vanilla'),
      ).toBeVisible();
    });
  },
};

export const EdgeCaseMenuIsVisibleInModal: Story = {
  name: 'Menu Is Visible in Modal',
  parameters: {
    edgeCaseDescription:
      'Opening a Select inside a modal keeps its option menu visible above the modal content.',
  },
  args,
  render: (renderArgs) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          testId="open_modal"
        >
          Open Modal
        </Button>
        <Modal
          header="Select in a Modal"
          isOpen={open}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Select {...renderArgs} />
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    // open modal
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('open_modal');
    await userEvent.click(trigger, { delay: 100 });
    // open menu
    const body = within(canvasElement?.parentElement as HTMLElement);
    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });
    // The option portal is inserted before the modal/menu transition finishes.
    // Wait for visibility so parallel browser workers do not race the animation.
    await waitFor(() => {
      expect(
        body.getByTestId('selectfield_select_option_vanilla'),
      ).toBeVisible();
    });
    await userEvent.click(
      body.getByTestId('selectfield_select_option_vanilla'),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const EdgeCaseFetchFallbackOutside: Story = {
  name: 'Fetch Fallback Outside',
  parameters: {
    edgeCaseDescription:
      'A selected value missing from the current options gets a readable label from separately fetched fallback data.',
    formProps: { initialValues: { selectField: 'secret_flavor' } },
  },
  render: (renderArgs) => {
    return <SelectWithFallbackFetch {...renderArgs} />;
  },
  args: {
    ...args,
    // Options don't include 'secret_flavor'
  },
};
