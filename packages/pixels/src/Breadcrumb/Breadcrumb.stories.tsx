import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BreadcrumbProps } from './Breadcrumb';

import Breadcrumb from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'pixels/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

const breadcrumbItems = [
  {
    children: 'Home',
  },
  {
    children: 'Music',
  },
  {
    children: 'Artist',
  },
  {
    children: 'Album',
  },
  {
    children: 'Song',
  },
];

export const Default: Story = {
  args: {
    breadcrumbItems,
  },
};

export const WithSeparator: Story = {
  args: {
    breadcrumbItems,
    separator: '/',
  },
};

export const WithMaxItems: Story = {
  args: {
    breadcrumbItems,
    maxItems: 3,
  },
};

export const AllVariants: Story = {
  args: {
    breadcrumbItems,
  },
  render: (args) => (
    <>
      {['solid', 'bordered', 'light'].map((variant) => (
        <div key={variant}>
          <span className="mb-2">{variant}:</span>
          <Breadcrumb
            {...args}
            key={variant}
            className="mb-12"
            variant={variant as BreadcrumbProps['variant']}
          />
        </div>
      ))}
    </>
  ),
};

export const AllSizes: Story = {
  args: {
    breadcrumbItems,
  },
  render: (args) => (
    <>
      {['sm', 'md', 'lg'].map((size) => (
        <div key={size}>
          <span className="mb-2">{size}:</span>
          <Breadcrumb
            {...args}
            key={size}
            className="mb-12"
            size={size as BreadcrumbProps['size']}
          />
        </div>
      ))}
    </>
  ),
};

export const AllUnderlines: Story = {
  args: {
    breadcrumbItems,
  },
  render: (args) => (
    <>
      {['none', 'active', 'hover', 'focus', 'always'].map((underline) => (
        <div key={underline}>
          <span className="mb-2">{underline}:</span>
          <Breadcrumb
            {...args}
            key={underline}
            className="mb-12"
            underline={underline as BreadcrumbProps['underline']}
          />
        </div>
      ))}
    </>
  ),
};
