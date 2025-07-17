/* eslint-disable react/no-array-index-key */

// see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/stories/colors.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';

import { parseToRgba, readableColor } from 'color2k';

// Since resolveConfig is no longer available in Tailwind CSS v4,
// we'll define the colors directly from the default Tailwind palette
const tailwindColors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  fuchsia: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
};

const themeColors = tailwindColors;

// Compute hex value from CSS class
const getHexFromClass = (bgClass: string): string => {
  try {
    const element = document.createElement('div');
    element.className = bgClass;
    document.body.appendChild(element);
    const computedStyle = getComputedStyle(element);
    const { backgroundColor } = computedStyle;
    document.body.removeChild(element);

    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const rgba = parseToRgba(backgroundColor);
      return `#${rgba
        .slice(0, 3)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;
    }
  } catch (error) {
    console.warn('Failed to compute color for class:', bgClass);
  }
  return '';
};

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
  const hexValue = className ? getHexFromClass(className) : '';

  return (
    <div
      className={`${className} border-divider m-2 flex h-24 w-24 flex-col items-center justify-center rounded-xl border`}
    >
      <span className={`${textClassName} text-center text-xs font-medium`}>
        {color}
      </span>
      {hexValue && (
        <span className={`${textClassName} text-center text-xs opacity-75`}>
          {hexValue}
        </span>
      )}
    </div>
  );
};

const SwatchSet = ({ colors, isSemantic = false }: SwatchSetProps) => (
  <div className="flex h-full w-full flex-row flex-wrap items-center justify-center p-2">
    {colors.map(({ title, items }) => (
      <div key={title} className="flex h-full w-full flex-col items-start">
        <h2 className="text-foreground text-xl font-bold">{title}</h2>
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
