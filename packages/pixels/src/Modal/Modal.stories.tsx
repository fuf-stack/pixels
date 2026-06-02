import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ModalProps } from './Modal';

import { useState } from 'react';

import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../Button';
import { ScrollShadow } from '../ScrollShadow';
import Modal, { modalVariants } from './Modal';
import ModalHost from './ModalHost';
import { modal } from './modalStore';
import { longContent, shortContent } from './storyData';

const meta: Meta<typeof Modal> = {
  title: 'pixels/Modal',
  component: Modal,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: Object.keys(modalVariants.variants.size),
    },
  },
};

export default meta;
type Story = StoryObj<ModalProps>;

const isTestEnv = process.env.NODE_ENV === 'test';

// Click the trigger and wait until the modal is visible, so the snapshot
// captures the opened modal instead of just the trigger button.
const playOpenModal: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const trigger = canvas.getByTestId('modal_trigger');
  await userEvent.click(trigger);

  await waitFor(() => {
    expect(canvas.getByTestId('modal')).toBeVisible();
  });
};

const Template: Story['render'] = (args, { canvasElement }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        disableAnimation={isTestEnv}
        onClick={onClick}
        testId="modal_trigger"
      >
        Open Modal
      </Button>
      <Modal
        {...args}
        isOpen={isOpen}
        onClose={onClose}
        portalContainer={canvasElement}
        disableAnimation={
          // eslint-disable-next-line react/destructuring-assignment
          isTestEnv || args.disableAnimation
        }
      />
    </>
  );
};

export const Default: Story = {
  args: {
    children: 'Modal Content',
  },
  render: Template,
  play: playOpenModal,
};

export const WithHeader: Story = {
  args: {
    header: 'Modal Header',
    children: shortContent,
  },
  render: Template,
  play: playOpenModal,
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: 'Modal Header',
    children: shortContent,
    footer: <Button>Some Action</Button>,
  },
  render: Template,
  play: playOpenModal,
};

export const ScrollLongContent: Story = {
  args: {
    header: 'Modal Header',
    children: longContent,
  },
  render: Template,
  play: playOpenModal,
};

export const WithScrollShadow: Story = {
  args: {
    header: 'Modal Header',
    className: { body: 'px-0 py-0' },
    children: (
      <ScrollShadow className="mb-4 px-6 pt-4">{longContent}</ScrollShadow>
    ),
  },
  render: Template,
  play: playOpenModal,
};

export const CustomStyles: Story = {
  args: {
    header: 'Custom Styles',
    children: 'This is very custom!',
    className: {
      body: 'py-6',
      backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
      base: 'border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]',
      header: 'border-b border-[#292f46]',
      footer: 'border-t border-[#292f46]',
      closeButton: 'hover:bg-white/5 active:bg-white/10',
    },
  },
  render: Template,
  play: playOpenModal,
};

const AllSizesTemplate: Story['render'] = (args) => {
  const [{ isOpen, content, size: currentSize }, setArgs] = useArgs();
  return (
    <>
      {Object.keys(modalVariants.variants.size).map((size) => {
        return (
          <div key={size} className="mt-2">
            <Button
              className="mr-2"
              onClick={() => {
                setArgs({
                  isOpen: true,
                  size,
                  content: `short ${size} content`,
                });
              }}
            >
              {size}
            </Button>
            <Button
              onClick={() => {
                setArgs({
                  isOpen: true,
                  size,
                  content: longContent,
                });
              }}
            >
              {`${size} scroll`}
            </Button>
            <Modal
              {...args}
              header={`Size ${size} Modal`}
              isOpen={isOpen}
              size={currentSize}
              onClose={() => {
                setArgs({ isOpen: false });
              }}
            >
              {content}
            </Modal>
          </div>
        );
      })}
    </>
  );
};

export const AllSizes: Story = {
  args: {
    header: 'Size',
  },
  render: AllSizesTemplate,
  argTypes: {
    // do not show size in controls table
    size: {
      table: {
        disable: true,
      },
    },
  },
};

export const WithModalHost: Story = {
  render: (_args, { canvasElement }) => {
    return (
      <>
        <ModalHost />
        <Button
          onClick={() => {
            modal.open({
              content: shortContent,
              header: 'Opened via modal.open()',
              portalContainer: canvasElement,
              disableAnimation: isTestEnv,
            });
          }}
        >
          Open via host
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Open via host'));
    await waitFor(() => {
      expect(canvas.getByText('Opened via modal.open()')).toBeInTheDocument();
    });
  },
};

const CloseAllButton = () => {
  return (
    <Button
      onClick={() => {
        modal.closeAll();
      }}
    >
      Close all
    </Button>
  );
};

const openThreeModals = (portalContainer: HTMLElement) => {
  modal.open({
    content: 'This is the first modal. Another one will open on top.',
    footer: <CloseAllButton />,
    header: 'First modal',
    portalContainer,
    disableAnimation: isTestEnv,
  });
  modal.open({
    content: 'This is the second modal, stacked above the first.',
    footer: <CloseAllButton />,
    header: 'Second modal',
    portalContainer,
    disableAnimation: isTestEnv,
  });
  modal.open({
    content: 'Smaller modal on top of the stack.',
    footer: <CloseAllButton />,
    header: 'Third modal',
    portalContainer,
    size: 'sm',
    disableAnimation: isTestEnv,
  });
};

export const MultipleModalsInHost: Story = {
  render: (_args, { canvasElement }) => {
    return (
      <>
        <ModalHost />
        <Button
          onClick={() => {
            openThreeModals(canvasElement);
          }}
        >
          Open all modals
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    // Backdrop of an opened modal blocks pointer events, so trigger
    // the imperative API directly instead of clicking through buttons.
    openThreeModals(canvasElement);
  },
};
