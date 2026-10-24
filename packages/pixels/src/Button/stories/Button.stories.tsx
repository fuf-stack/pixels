import type { Story } from './Button.storySetup';

import { FaEnvelope } from 'react-icons/fa';

import Button from '../Button';
import {
  buttonVariantsExtended,
  colors,
  meta as sharedMeta,
  sizes,
  variants,
} from './Button.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/Button' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: { children: 'Button' },
};

export const Basic: Story = {
  args: {
    children: 'Button',
    testId: 'some-test-id',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

export const IconOnly: Story = {
  args: {
    ariaLabel: 'Email',
    icon: <FaEnvelope />,
    children: undefined,
    color: 'danger',
    size: 'sm',
  },
};

export const Loading: Story = {
  args: {
    children: 'Button',
    loading: true,
  },
};

export const Ripple: Story = {
  args: {
    children: 'Ripple',
    ripple: true,
  },
};

export const DisabledAnimation: Story = {
  args: {
    children: 'Button',
    disableAnimation: true,
  },
};

export const AllColors: Story = {
  render: () => {
    return (
      <>
        {colors.map((color) => {
          return (
            <div key={color} style={{ marginTop: '10px' }}>
              <Button color={color}>{color}</Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllRadius: Story = {
  render: (args) => {
    return (
      <>
        {(['sm', 'md', 'lg', 'none', 'full'] as const).map((radius) => {
          return (
            <div key={radius} style={{ marginTop: '10px' }}>
              <Button radius={radius} {...args}>
                {radius}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllSizes: Story = {
  render: (args) => {
    return (
      <>
        {sizes.map((size) => {
          return (
            <div key={size} style={{ marginTop: '10px' }}>
              <Button size={size} {...args}>
                {size}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllVariants: Story = {
  render: (args) => {
    return (
      <>
        {variants.map((variant) => {
          return (
            <div key={variant} style={{ marginTop: '10px' }}>
              <Button variant={variant} {...args}>
                {variant}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const ExtendVariantStyles: Story = {
  args: {
    children: 'Extended Button',
    className: 'text-success',
  },
  render: ({ color = 'default', variant = 'solid', size = 'md', ...rest }) => {
    // className from slots
    const extendedClassNames = buttonVariantsExtended({
      color,
      variant,
      size,
      ...rest,
    });

    return <Button {...rest} className={extendedClassNames} />;
  },
};
