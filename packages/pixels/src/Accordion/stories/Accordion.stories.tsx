import type { AccordionProps } from '../Accordion';
import type { Story } from './Accordion.storySetup';

import Accordion from '../Accordion';
import { accordionItems, meta as sharedMeta } from './Accordion.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/Accordion' };

export default meta;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    accordionItems,
  },
};

export const WithSubtitle: Story = {
  args: {
    accordionItems: [
      { title: '1.', children: <div>First item</div>, subtitle: 'Subtitle' },
      { title: '2.', children: <div>Second item</div>, subtitle: 'Subtitle' },
      { title: '3.', children: <div>Third item</div>, subtitle: 'Subtitle' },
    ],
  },
};
export const AllVariants: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="accordion"]' } },
  args: {
    accordionItems,
    indicatorLeft: false,
  },
  render: (args) => {
    return (
      <div className="w-96">
        {['light', 'shadow', 'bordered', 'splitted'].map((variant) => {
          return (
            <Accordion
              {...args}
              key={variant}
              className="mb-12"
              variant={variant as AccordionProps['variant']}
            />
          );
        })}
      </div>
    );
  },
};

export const OnlySingleSelection: Story = {
  args: {
    selectionMode: 'single',
    accordionItems,
  },
};

export const DefaultOpen: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="accordion"]' } },
  args: {
    defaultSelectedKeys: ['1'],
    accordionItems,
  },
};

export const IndicatorLeft: Story = {
  args: {
    accordionItems,
    indicatorLeft: true,
  },
};

export const CustomStyling: Story = {
  args: {
    accordionItems,
    className: {
      base: 'py-0',
      title: 'font-normal text-medium',
      trigger:
        'py-0 data-[hover=true]:bg-blue-100 rounded-lg h-14 flex items-center',
      indicator: 'text-medium rotate-180 data-[open=true]:rotate-90',
      content: 'text-small px-2',
      wrapper: 'w-96',
    },
  },
};
