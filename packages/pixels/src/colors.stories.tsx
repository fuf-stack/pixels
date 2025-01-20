/* eslint-disable react/no-array-index-key */

// see: https://github.comnextui-orgnextui/blob/canary/packages/core/theme/stories/colors.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';

import plugins from '@repo/tailwind-config/plugins';
import theme from '@repo/tailwind-config/theme';
import { parseToRgba, readableColor } from 'color2k';
import resolveConfig from 'tailwindcss/resolveConfig';

const tailwindConfig = resolveConfig({
  content: [],
  plugins,
  theme: { extend: theme },
});

const themeColors = tailwindConfig.theme.colors;

type ColorsItem = {
  className?: string;
  color: string;
  name?: string;
  textClassName?: string;
};

type SwatchColors = {
  title: string;
  items: ColorsItem[];
};

type SwatchSetProps = {
  colors: SwatchColors[];
  isSemantic?: boolean;
};

const Swatch = ({
  color,
  name = undefined,
}: {
  color: string;
  name?: string;
}) => {
  const colorText = color
    ? `#${parseToRgba(color)
        .slice(0, 3)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`
    : 'N/A';

  return (
    <div
      className="m-2 flex h-24 w-24 flex-col items-center justify-center rounded-xl shadow-lg"
      style={{
        backgroundColor: color,
      }}
    >
      {name && (
        <span
          className="text-xs"
          style={{
            color: readableColor(color),
          }}
        >
          {name}
        </span>
      )}
      <span
        className="text-sm"
        style={{
          color: readableColor(color),
        }}
      >
        {colorText}
      </span>
    </div>
  );
};

const SemanticSwatch = ({
  color,
  className = undefined,
  textClassName = undefined,
}: {
  color: string;
  className?: string;
  textClassName?: string;
}) => {
  return (
    <div
      className={`${className} m-2 flex h-24 w-24 flex-col items-center justify-center rounded-xl shadow-lg`}
    >
      <span className={`${textClassName} text-sm`}>{color}</span>
    </div>
  );
};

const SwatchSet = ({ colors, isSemantic = false }: SwatchSetProps) => (
  <div className="flex h-full w-full flex-row flex-wrap items-center justify-center p-2">
    {colors.map(({ title, items }) => (
      <div key={title} className="flex h-full w-full flex-col items-start">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex h-full w-full flex-row flex-wrap items-center justify-start p-4">
          {items.map((item, index) =>
            isSemantic ? (
              <SemanticSwatch
                key={`${item.color}-${index}`}
                color={item.color}
                className={item.className}
                textClassName={item.textClassName}
              />
            ) : (
              <Swatch
                key={`${item.color}-${index}`}
                color={item.color}
                name={item.name}
              />
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);

const meta: Meta<typeof SwatchSet> = {
  title: 'Colors',
  component: SwatchSet,
  argTypes: {
    isSemantic: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SwatchSet>;

const getColorItems = (
  colorObj: Record<string, string>,
  prefix: string = '',
) => {
  return Object.entries(colorObj).map(([key, value]) => ({
    name: prefix ? `${prefix}-${key}` : key,
    color: value,
  }));
};

export const CommonColors: Story = {
  args: {
    colors: [
      {
        title: 'Base',
        items: [
          { name: 'white', color: themeColors.white },
          { name: 'black', color: themeColors.black },
        ],
      },
      {
        title: 'Blue',
        items: getColorItems(themeColors.blue, 'blue'),
      },
      {
        title: 'Purple',
        items: getColorItems(themeColors.purple, 'purple'),
      },
      {
        title: 'Green',
        items: getColorItems(themeColors.green, 'green'),
      },
      {
        title: 'Red',
        items: getColorItems(themeColors.red, 'red'),
      },
      {
        title: 'Pink',
        items: getColorItems(themeColors.pink, 'pink'),
      },
      {
        title: 'Yellow',
        items: getColorItems(themeColors.yellow, 'yellow'),
      },
      {
        title: 'Cyan',
        items: getColorItems(themeColors.cyan, 'cyan'),
      },
    ],
  },
};

export const SemanticColors: Story = {
  args: {
    isSemantic: true,
    colors: [
      {
        title: 'Layout',
        items: [
          {
            color: 'background',
            className: 'bg-background',
            textClassName: 'text-foreground',
          },
          {
            color: 'foreground',
            className: 'bg-foreground',
            textClassName: 'text-background',
          },
          {
            color: 'divider',
            className: 'bg-divider',
            textClassName: 'text-foreground',
          },
          {
            color: 'focus',
            className: 'bg-focus',
            textClassName: 'text-primary-foreground',
          },
        ],
      },
      {
        title: 'Content',
        items: [
          {
            color: 'content1',
            className: 'bg-content1',
            textClassName: 'text-content1-foreground',
          },
          {
            color: 'content2',
            className: 'bg-content2',
            textClassName: 'text-content2-foreground',
          },
          {
            color: 'content3',
            className: 'bg-content3',
            textClassName: 'text-content3-foreground',
          },
          {
            color: 'content4',
            className: 'bg-content4',
            textClassName: 'text-content4-foreground',
          },
        ],
      },
      {
        title: 'Base',
        items: [
          {
            color: 'default',
            className: 'bg-default',
            textClassName: 'text-default-foreground',
          },
          {
            color: 'primary',
            className: 'bg-primary',
            textClassName: 'text-primary-foreground',
          },
          {
            color: 'secondary',
            className: 'bg-secondary',
            textClassName: 'text-secondary-foreground',
          },
          {
            color: 'success',
            className: 'bg-success',
            textClassName: 'text-success-foreground',
          },
          {
            color: 'info',
            className: 'bg-info',
            textClassName: 'text-info-foreground',
          },
          {
            color: 'warning',
            className: 'bg-warning',
            textClassName: 'text-warning-foreground',
          },
          {
            color: 'danger',
            className: 'bg-danger',
            textClassName: 'text-danger-foreground',
          },
        ],
      },
      {
        title: 'Default',
        items: [
          {
            color: 'default-50',
            className: 'bg-default-50',
            textClassName: 'text-default-900',
          },
          {
            color: 'default-100',
            className: 'bg-default-100',
            textClassName: 'text-default-900',
          },
          {
            color: 'default-200',
            className: 'bg-default-200',
            textClassName: 'text-default-800',
          },
          {
            color: 'default-300',
            className: 'bg-default-300',
            textClassName: 'text-default-800',
          },
          {
            color: 'default-400',
            className: 'bg-default-400',
            textClassName: 'text-default-800',
          },
          {
            color: 'default-500',
            className: 'bg-default-500',
            textClassName: 'text-default-foreground',
          },
          {
            color: 'default-600',
            className: 'bg-default-600',
            textClassName: 'text-default-50',
          },
          {
            color: 'default-700',
            className: 'bg-default-700',
            textClassName: 'text-default-100',
          },
          {
            color: 'default-800',
            className: 'bg-default-800',
            textClassName: 'text-default-100',
          },
          {
            color: 'default-900',
            className: 'bg-default-900',
            textClassName: 'text-default-100',
          },
        ],
      },
      {
        title: 'Primary',
        items: [
          {
            color: 'primary-50',
            className: 'bg-primary-50',
            textClassName: 'text-primary-900',
          },
          {
            color: 'primary-100',
            className: 'bg-primary-100',
            textClassName: 'text-primary-900',
          },
          {
            color: 'primary-200',
            className: 'bg-primary-200',
            textClassName: 'text-primary-800',
          },
          {
            color: 'primary-300',
            className: 'bg-primary-300',
            textClassName: 'text-primary-800',
          },
          {
            color: 'primary-400',
            className: 'bg-primary-400',
            textClassName: 'text-primary-800',
          },
          {
            color: 'primary-500',
            className: 'bg-primary-500',
            textClassName: 'text-primary-foreground',
          },
          {
            color: 'primary-600',
            className: 'bg-primary-600',
            textClassName: 'text-primary-50',
          },
          {
            color: 'primary-700',
            className: 'bg-primary-700',
            textClassName: 'text-primary-100',
          },
          {
            color: 'primary-800',
            className: 'bg-primary-800',
            textClassName: 'text-primary-100',
          },
          {
            color: 'primary-900',
            className: 'bg-primary-900',
            textClassName: 'text-primary-100',
          },
        ],
      },
      {
        title: 'Secondary',
        items: [
          {
            color: 'secondary-50',
            className: 'bg-secondary-50',
            textClassName: 'text-secondary-900',
          },
          {
            color: 'secondary-100',
            className: 'bg-secondary-100',
            textClassName: 'text-secondary-900',
          },
          {
            color: 'secondary-200',
            className: 'bg-secondary-200',
            textClassName: 'text-secondary-800',
          },
          {
            color: 'secondary-300',
            className: 'bg-secondary-300',
            textClassName: 'text-secondary-800',
          },
          {
            color: 'secondary-400',
            className: 'bg-secondary-400',
            textClassName: 'text-secondary-800',
          },
          {
            color: 'secondary-500',
            className: 'bg-secondary-500',
            textClassName: 'text-secondary-foreground',
          },
          {
            color: 'secondary-600',
            className: 'bg-secondary-600',
            textClassName: 'text-secondary-50',
          },
          {
            color: 'secondary-700',
            className: 'bg-secondary-700',
            textClassName: 'text-secondary-100',
          },
          {
            color: 'secondary-800',
            className: 'bg-secondary-800',
            textClassName: 'text-secondary-100',
          },
          {
            color: 'secondary-900',
            className: 'bg-secondary-900',
            textClassName: 'text-secondary-100',
          },
        ],
      },
      {
        title: 'Success',
        items: [
          {
            color: 'success-50',
            className: 'bg-success-50',
            textClassName: 'text-success-900',
          },
          {
            color: 'success-100',
            className: 'bg-success-100',
            textClassName: 'text-success-900',
          },
          {
            color: 'success-200',
            className: 'bg-success-200',
            textClassName: 'text-success-800',
          },
          {
            color: 'success-300',
            className: 'bg-success-300',
            textClassName: 'text-success-800',
          },
          {
            color: 'success-400',
            className: 'bg-success-400',
            textClassName: 'text-success-800',
          },
          {
            color: 'success-500',
            className: 'bg-success-500',
            textClassName: 'text-success-foreground',
          },
          {
            color: 'success-600',
            className: 'bg-success-600',
            textClassName: 'text-success-50',
          },
          {
            color: 'success-700',
            className: 'bg-success-700',
            textClassName: 'text-success-100',
          },
          {
            color: 'success-800',
            className: 'bg-success-800',
            textClassName: 'text-success-100',
          },
          {
            color: 'success-900',
            className: 'bg-success-900',
            textClassName: 'text-success-100',
          },
        ],
      },
      {
        title: 'Info',
        items: [
          {
            color: 'info-50',
            className: 'bg-info-50',
            textClassName: 'text-info-900',
          },
          {
            color: 'info-100',
            className: 'bg-info-100',
            textClassName: 'text-info-900',
          },
          {
            color: 'info-200',
            className: 'bg-info-200',
            textClassName: 'text-info-800',
          },
          {
            color: 'info-300',
            className: 'bg-info-300',
            textClassName: 'text-info-800',
          },
          {
            color: 'info-400',
            className: 'bg-info-400',
            textClassName: 'text-info-800',
          },
          {
            color: 'info-500',
            className: 'bg-info-500',
            textClassName: 'text-info-foreground',
          },
          {
            color: 'info-600',
            className: 'bg-info-600',
            textClassName: 'text-info-50',
          },
          {
            color: 'info-700',
            className: 'bg-info-700',
            textClassName: 'text-info-100',
          },
          {
            color: 'info-800',
            className: 'bg-info-800',
            textClassName: 'text-info-100',
          },
          {
            color: 'info-900',
            className: 'bg-info-900',
            textClassName: 'text-info-100',
          },
        ],
      },
      {
        title: 'Warning',
        items: [
          {
            color: 'warning-50',
            className: 'bg-warning-50',
            textClassName: 'text-warning-900',
          },
          {
            color: 'warning-100',
            className: 'bg-warning-100',
            textClassName: 'text-warning-900',
          },
          {
            color: 'warning-200',
            className: 'bg-warning-200',
            textClassName: 'text-warning-800',
          },
          {
            color: 'warning-300',
            className: 'bg-warning-300',
            textClassName: 'text-warning-800',
          },
          {
            color: 'warning-400',
            className: 'bg-warning-400',
            textClassName: 'text-warning-800',
          },
          {
            color: 'warning-500',
            className: 'bg-warning-500',
            textClassName: 'text-warning-foreground',
          },
          {
            color: 'warning-600',
            className: 'bg-warning-600',
            textClassName: 'text-warning-50',
          },
          {
            color: 'warning-700',
            className: 'bg-warning-700',
            textClassName: 'text-warning-100',
          },
          {
            color: 'warning-800',
            className: 'bg-warning-800',
            textClassName: 'text-warning-100',
          },
          {
            color: 'warning-900',
            className: 'bg-warning-900',
            textClassName: 'text-warning-100',
          },
        ],
      },
      {
        title: 'Danger',
        items: [
          {
            color: 'danger-50',
            className: 'bg-danger-50',
            textClassName: 'text-danger-900',
          },
          {
            color: 'danger-100',
            className: 'bg-danger-100',
            textClassName: 'text-danger-900',
          },
          {
            color: 'danger-200',
            className: 'bg-danger-200',
            textClassName: 'text-danger-800',
          },
          {
            color: 'danger-300',
            className: 'bg-danger-300',
            textClassName: 'text-danger-800',
          },
          {
            color: 'danger-400',
            className: 'bg-danger-400',
            textClassName: 'text-danger-800',
          },
          {
            color: 'danger-500',
            className: 'bg-danger-500',
            textClassName: 'text-danger-foreground',
          },
          {
            color: 'danger-600',
            className: 'bg-danger-600',
            textClassName: 'text-danger-50',
          },
          {
            color: 'danger-700',
            className: 'bg-danger-700',
            textClassName: 'text-danger-100',
          },
          {
            color: 'danger-800',
            className: 'bg-danger-800',
            textClassName: 'text-danger-100',
          },
          {
            color: 'danger-900',
            className: 'bg-danger-900',
            textClassName: 'text-danger-100',
          },
        ],
      },
    ],
  },
};
