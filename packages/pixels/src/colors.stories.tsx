/* eslint-disable react/no-array-index-key */

// see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/stories/colors.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';

import { useEffect, useMemo, useState } from 'react';

import { parseToRgba } from 'color2k';

// Compute hex value from CSS class
const getHexFromClass = (bgClass: string): string => {
  try {
    const element = document.createElement('div');
    element.className = bgClass;
    document.body.appendChild(element);
    const computedStyle = getComputedStyle(element);
    const { backgroundColor } = computedStyle;
    document.body.removeChild(element);

    if (
      backgroundColor &&
      backgroundColor !== 'rgba(0, 0, 0, 0)' &&
      backgroundColor !== 'transparent'
    ) {
      // Handle OKLCH format from Tailwind v4
      if (backgroundColor.startsWith('oklch(')) {
        // Create a temporary element to let the browser convert OKLCH to RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = backgroundColor;
        tempDiv.style.color = backgroundColor; // Fallback
        document.body.appendChild(tempDiv);

        // Force a style calculation
        const rgbColor = getComputedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);

        // If browser converted it to rgb format, use that
        if (
          rgbColor &&
          rgbColor !== backgroundColor &&
          !rgbColor.startsWith('oklch(')
        ) {
          const rgba = parseToRgba(rgbColor);
          return `#${rgba
            .slice(0, 3)
            .map((x) => x.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()}`;
        }

        // Manual OKLCH to RGB conversion as fallback
        return convertOklchToHex(backgroundColor);
      }

      // Handle standard RGB/RGBA/HSL formats
      const rgba = parseToRgba(backgroundColor);
      return `#${rgba
        .slice(0, 3)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;
    }
  } catch (error) {
    console.warn('Failed to compute color for class:', bgClass, error);
  }
  return '';
};

// Convert OKLCH to HEX (simplified conversion)
const convertOklchToHex = (oklchString: string): string => {
  try {
    // Extract OKLCH values: oklch(L C H)
    const match = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (!match) return '';

    // This is a simplified conversion. For production, you'd want a proper OKLCH->RGB library
    // For now, let's use a canvas to let the browser do the conversion
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = oklchString;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    return `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
  } catch (error) {
    console.warn('Failed to convert OKLCH:', oklchString, error);
    return '';
  }
};

// Types

type ColorsItem = {
  className?: string;
  color?: string;
  name?: string;
  textClassName?: string;
};

type SwatchColors = {
  title: string;
  items: ColorsItem[];
};

type SwatchSetProps = {
  colors: SwatchColors[];
};

const Swatch = ({
  className = undefined,
  color = undefined,
  name = undefined,
  observedTheme = undefined,
  textClassName = undefined,
}: {
  className?: string;
  color?: string;
  name?: string;
  observedTheme?: 'light' | 'dark';
  textClassName?: string;
}) => {
  const label = name || color;

  // recalculate hex value when observed theme changes
  const hexValue = useMemo(() => {
    return getHexFromClass(className || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, observedTheme]);

  return (
    <div
      className={`${className} border-divider m-2 flex h-24 w-24 flex-col items-center justify-center rounded-xl border`}
    >
      {label && (
        <span className={`${textClassName} text-center text-xs font-medium`}>
          {label}
        </span>
      )}
      {hexValue && (
        <span className={`${textClassName} text-center text-xs opacity-75`}>
          {hexValue}
        </span>
      )}
    </div>
  );
};

const SwatchSet = ({ colors }: SwatchSetProps) => {
  const [observedTheme, setObservedTheme] = useState<
    'light' | 'dark' | undefined
  >();

  // Observe theme changes via attribute mutations on the <html> element
  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver((mutationList) => {
      // @ts-expect-error - target is a HTML element
      const nextTheme = mutationList[0].target.classList.contains('dark')
        ? 'dark'
        : 'light';
      console.log('MutationObserver theme changed to', nextTheme);
      setObservedTheme(nextTheme);
    });
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-row flex-wrap items-center justify-center p-2">
      {colors.map(({ title, items }) => (
        <div key={title} className="flex h-full w-full flex-col items-start">
          <h2 className="text-foreground text-xl font-bold">{title}</h2>
          <div className="flex h-full w-full flex-row flex-wrap items-center justify-start p-4">
            {items.map((item, index) => (
              <Swatch
                key={`${item.name || item.color}-${index}`}
                className={item.className}
                color={item.color}
                name={item.name}
                observedTheme={observedTheme}
                textClassName={item.textClassName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const meta: Meta<typeof SwatchSet> = {
  title: 'Colors',
  component: SwatchSet,
};

export default meta;
type Story = StoryObj<typeof SwatchSet>;

export const TailwindColors: Story = {
  args: {
    colors: [
      {
        title: 'Base',
        items: [
          { name: 'white', className: 'bg-white', textClassName: 'text-black' },
          { name: 'black', className: 'bg-black', textClassName: 'text-white' },
        ],
      },
      {
        title: 'Red',
        items: [
          {
            name: 'red-50',
            className: 'bg-red-50',
            textClassName: 'text-red-900',
          },
          {
            name: 'red-100',
            className: 'bg-red-100',
            textClassName: 'text-red-900',
          },
          {
            name: 'red-200',
            className: 'bg-red-200',
            textClassName: 'text-red-900',
          },
          {
            name: 'red-300',
            className: 'bg-red-300',
            textClassName: 'text-red-900',
          },
          {
            name: 'red-400',
            className: 'bg-red-400',
            textClassName: 'text-red-900',
          },
          {
            name: 'red-500',
            className: 'bg-red-500',
            textClassName: 'text-red-50',
          },
          {
            name: 'red-600',
            className: 'bg-red-600',
            textClassName: 'text-red-50',
          },
          {
            name: 'red-700',
            className: 'bg-red-700',
            textClassName: 'text-red-50',
          },
          {
            name: 'red-800',
            className: 'bg-red-800',
            textClassName: 'text-red-50',
          },
          {
            name: 'red-900',
            className: 'bg-red-900',
            textClassName: 'text-red-50',
          },
          {
            name: 'red-950',
            className: 'bg-red-950',
            textClassName: 'text-red-50',
          },
        ],
      },
      {
        title: 'Orange',
        items: [
          {
            name: 'orange-50',
            className: 'bg-orange-50',
            textClassName: 'text-orange-900',
          },
          {
            name: 'orange-100',
            className: 'bg-orange-100',
            textClassName: 'text-orange-900',
          },
          {
            name: 'orange-200',
            className: 'bg-orange-200',
            textClassName: 'text-orange-900',
          },
          {
            name: 'orange-300',
            className: 'bg-orange-300',
            textClassName: 'text-orange-900',
          },
          {
            name: 'orange-400',
            className: 'bg-orange-400',
            textClassName: 'text-orange-900',
          },
          {
            name: 'orange-500',
            className: 'bg-orange-500',
            textClassName: 'text-orange-50',
          },
          {
            name: 'orange-600',
            className: 'bg-orange-600',
            textClassName: 'text-orange-50',
          },
          {
            name: 'orange-700',
            className: 'bg-orange-700',
            textClassName: 'text-orange-50',
          },
          {
            name: 'orange-800',
            className: 'bg-orange-800',
            textClassName: 'text-orange-50',
          },
          {
            name: 'orange-900',
            className: 'bg-orange-900',
            textClassName: 'text-orange-50',
          },
          {
            name: 'orange-950',
            className: 'bg-orange-950',
            textClassName: 'text-orange-50',
          },
        ],
      },
      {
        title: 'Amber',
        items: [
          {
            name: 'amber-50',
            className: 'bg-amber-50',
            textClassName: 'text-amber-900',
          },
          {
            name: 'amber-100',
            className: 'bg-amber-100',
            textClassName: 'text-amber-900',
          },
          {
            name: 'amber-200',
            className: 'bg-amber-200',
            textClassName: 'text-amber-900',
          },
          {
            name: 'amber-300',
            className: 'bg-amber-300',
            textClassName: 'text-amber-900',
          },
          {
            name: 'amber-400',
            className: 'bg-amber-400',
            textClassName: 'text-amber-900',
          },
          {
            name: 'amber-500',
            className: 'bg-amber-500',
            textClassName: 'text-amber-50',
          },
          {
            name: 'amber-600',
            className: 'bg-amber-600',
            textClassName: 'text-amber-50',
          },
          {
            name: 'amber-700',
            className: 'bg-amber-700',
            textClassName: 'text-amber-50',
          },
          {
            name: 'amber-800',
            className: 'bg-amber-800',
            textClassName: 'text-amber-50',
          },
          {
            name: 'amber-900',
            className: 'bg-amber-900',
            textClassName: 'text-amber-50',
          },
          {
            name: 'amber-950',
            className: 'bg-amber-950',
            textClassName: 'text-amber-50',
          },
        ],
      },
      {
        title: 'Yellow',
        items: [
          {
            name: 'yellow-50',
            className: 'bg-yellow-50',
            textClassName: 'text-yellow-900',
          },
          {
            name: 'yellow-100',
            className: 'bg-yellow-100',
            textClassName: 'text-yellow-900',
          },
          {
            name: 'yellow-200',
            className: 'bg-yellow-200',
            textClassName: 'text-yellow-900',
          },
          {
            name: 'yellow-300',
            className: 'bg-yellow-300',
            textClassName: 'text-yellow-900',
          },
          {
            name: 'yellow-400',
            className: 'bg-yellow-400',
            textClassName: 'text-yellow-900',
          },
          {
            name: 'yellow-500',
            className: 'bg-yellow-500',
            textClassName: 'text-yellow-50',
          },
          {
            name: 'yellow-600',
            className: 'bg-yellow-600',
            textClassName: 'text-yellow-50',
          },
          {
            name: 'yellow-700',
            className: 'bg-yellow-700',
            textClassName: 'text-yellow-50',
          },
          {
            name: 'yellow-800',
            className: 'bg-yellow-800',
            textClassName: 'text-yellow-50',
          },
          {
            name: 'yellow-900',
            className: 'bg-yellow-900',
            textClassName: 'text-yellow-50',
          },
          {
            name: 'yellow-950',
            className: 'bg-yellow-950',
            textClassName: 'text-yellow-50',
          },
        ],
      },
      {
        title: 'Lime',
        items: [
          {
            name: 'lime-50',
            className: 'bg-lime-50',
            textClassName: 'text-lime-900',
          },
          {
            name: 'lime-100',
            className: 'bg-lime-100',
            textClassName: 'text-lime-900',
          },
          {
            name: 'lime-200',
            className: 'bg-lime-200',
            textClassName: 'text-lime-900',
          },
          {
            name: 'lime-300',
            className: 'bg-lime-300',
            textClassName: 'text-lime-900',
          },
          {
            name: 'lime-400',
            className: 'bg-lime-400',
            textClassName: 'text-lime-900',
          },
          {
            name: 'lime-500',
            className: 'bg-lime-500',
            textClassName: 'text-lime-50',
          },
          {
            name: 'lime-600',
            className: 'bg-lime-600',
            textClassName: 'text-lime-50',
          },
          {
            name: 'lime-700',
            className: 'bg-lime-700',
            textClassName: 'text-lime-50',
          },
          {
            name: 'lime-800',
            className: 'bg-lime-800',
            textClassName: 'text-lime-50',
          },
          {
            name: 'lime-900',
            className: 'bg-lime-900',
            textClassName: 'text-lime-50',
          },
          {
            name: 'lime-950',
            className: 'bg-lime-950',
            textClassName: 'text-lime-50',
          },
        ],
      },
      {
        title: 'Green',
        items: [
          {
            name: 'green-50',
            className: 'bg-green-50',
            textClassName: 'text-green-900',
          },
          {
            name: 'green-100',
            className: 'bg-green-100',
            textClassName: 'text-green-900',
          },
          {
            name: 'green-200',
            className: 'bg-green-200',
            textClassName: 'text-green-900',
          },
          {
            name: 'green-300',
            className: 'bg-green-300',
            textClassName: 'text-green-900',
          },
          {
            name: 'green-400',
            className: 'bg-green-400',
            textClassName: 'text-green-900',
          },
          {
            name: 'green-500',
            className: 'bg-green-500',
            textClassName: 'text-green-50',
          },
          {
            name: 'green-600',
            className: 'bg-green-600',
            textClassName: 'text-green-50',
          },
          {
            name: 'green-700',
            className: 'bg-green-700',
            textClassName: 'text-green-50',
          },
          {
            name: 'green-800',
            className: 'bg-green-800',
            textClassName: 'text-green-50',
          },
          {
            name: 'green-900',
            className: 'bg-green-900',
            textClassName: 'text-green-50',
          },
          {
            name: 'green-950',
            className: 'bg-green-950',
            textClassName: 'text-green-50',
          },
        ],
      },
      {
        title: 'Emerald',
        items: [
          {
            name: 'emerald-50',
            className: 'bg-emerald-50',
            textClassName: 'text-emerald-900',
          },
          {
            name: 'emerald-100',
            className: 'bg-emerald-100',
            textClassName: 'text-emerald-900',
          },
          {
            name: 'emerald-200',
            className: 'bg-emerald-200',
            textClassName: 'text-emerald-900',
          },
          {
            name: 'emerald-300',
            className: 'bg-emerald-300',
            textClassName: 'text-emerald-900',
          },
          {
            name: 'emerald-400',
            className: 'bg-emerald-400',
            textClassName: 'text-emerald-900',
          },
          {
            name: 'emerald-500',
            className: 'bg-emerald-500',
            textClassName: 'text-emerald-50',
          },
          {
            name: 'emerald-600',
            className: 'bg-emerald-600',
            textClassName: 'text-emerald-50',
          },
          {
            name: 'emerald-700',
            className: 'bg-emerald-700',
            textClassName: 'text-emerald-50',
          },
          {
            name: 'emerald-800',
            className: 'bg-emerald-800',
            textClassName: 'text-emerald-50',
          },
          {
            name: 'emerald-900',
            className: 'bg-emerald-900',
            textClassName: 'text-emerald-50',
          },
          {
            name: 'emerald-950',
            className: 'bg-emerald-950',
            textClassName: 'text-emerald-50',
          },
        ],
      },
      {
        title: 'Teal',
        items: [
          {
            name: 'teal-50',
            className: 'bg-teal-50',
            textClassName: 'text-teal-900',
          },
          {
            name: 'teal-100',
            className: 'bg-teal-100',
            textClassName: 'text-teal-900',
          },
          {
            name: 'teal-200',
            className: 'bg-teal-200',
            textClassName: 'text-teal-900',
          },
          {
            name: 'teal-300',
            className: 'bg-teal-300',
            textClassName: 'text-teal-900',
          },
          {
            name: 'teal-400',
            className: 'bg-teal-400',
            textClassName: 'text-teal-900',
          },
          {
            name: 'teal-500',
            className: 'bg-teal-500',
            textClassName: 'text-teal-50',
          },
          {
            name: 'teal-600',
            className: 'bg-teal-600',
            textClassName: 'text-teal-50',
          },
          {
            name: 'teal-700',
            className: 'bg-teal-700',
            textClassName: 'text-teal-50',
          },
          {
            name: 'teal-800',
            className: 'bg-teal-800',
            textClassName: 'text-teal-50',
          },
          {
            name: 'teal-900',
            className: 'bg-teal-900',
            textClassName: 'text-teal-50',
          },
          {
            name: 'teal-950',
            className: 'bg-teal-950',
            textClassName: 'text-teal-50',
          },
        ],
      },
      {
        title: 'Cyan',
        items: [
          {
            name: 'cyan-50',
            className: 'bg-cyan-50',
            textClassName: 'text-cyan-900',
          },
          {
            name: 'cyan-100',
            className: 'bg-cyan-100',
            textClassName: 'text-cyan-900',
          },
          {
            name: 'cyan-200',
            className: 'bg-cyan-200',
            textClassName: 'text-cyan-900',
          },
          {
            name: 'cyan-300',
            className: 'bg-cyan-300',
            textClassName: 'text-cyan-900',
          },
          {
            name: 'cyan-400',
            className: 'bg-cyan-400',
            textClassName: 'text-cyan-900',
          },
          {
            name: 'cyan-500',
            className: 'bg-cyan-500',
            textClassName: 'text-cyan-50',
          },
          {
            name: 'cyan-600',
            className: 'bg-cyan-600',
            textClassName: 'text-cyan-50',
          },
          {
            name: 'cyan-700',
            className: 'bg-cyan-700',
            textClassName: 'text-cyan-50',
          },
          {
            name: 'cyan-800',
            className: 'bg-cyan-800',
            textClassName: 'text-cyan-50',
          },
          {
            name: 'cyan-900',
            className: 'bg-cyan-900',
            textClassName: 'text-cyan-50',
          },
          {
            name: 'cyan-950',
            className: 'bg-cyan-950',
            textClassName: 'text-cyan-50',
          },
        ],
      },
      {
        title: 'Sky',
        items: [
          {
            name: 'sky-50',
            className: 'bg-sky-50',
            textClassName: 'text-sky-900',
          },
          {
            name: 'sky-100',
            className: 'bg-sky-100',
            textClassName: 'text-sky-900',
          },
          {
            name: 'sky-200',
            className: 'bg-sky-200',
            textClassName: 'text-sky-900',
          },
          {
            name: 'sky-300',
            className: 'bg-sky-300',
            textClassName: 'text-sky-900',
          },
          {
            name: 'sky-400',
            className: 'bg-sky-400',
            textClassName: 'text-sky-900',
          },
          {
            name: 'sky-500',
            className: 'bg-sky-500',
            textClassName: 'text-sky-50',
          },
          {
            name: 'sky-600',
            className: 'bg-sky-600',
            textClassName: 'text-sky-50',
          },
          {
            name: 'sky-700',
            className: 'bg-sky-700',
            textClassName: 'text-sky-50',
          },
          {
            name: 'sky-800',
            className: 'bg-sky-800',
            textClassName: 'text-sky-50',
          },
          {
            name: 'sky-900',
            className: 'bg-sky-900',
            textClassName: 'text-sky-50',
          },
          {
            name: 'sky-950',
            className: 'bg-sky-950',
            textClassName: 'text-sky-50',
          },
        ],
      },
      {
        title: 'Blue',
        items: [
          {
            name: 'blue-50',
            className: 'bg-blue-50',
            textClassName: 'text-blue-900',
          },
          {
            name: 'blue-100',
            className: 'bg-blue-100',
            textClassName: 'text-blue-900',
          },
          {
            name: 'blue-200',
            className: 'bg-blue-200',
            textClassName: 'text-blue-900',
          },
          {
            name: 'blue-300',
            className: 'bg-blue-300',
            textClassName: 'text-blue-900',
          },
          {
            name: 'blue-400',
            className: 'bg-blue-400',
            textClassName: 'text-blue-900',
          },
          {
            name: 'blue-500',
            className: 'bg-blue-500',
            textClassName: 'text-blue-50',
          },
          {
            name: 'blue-600',
            className: 'bg-blue-600',
            textClassName: 'text-blue-50',
          },
          {
            name: 'blue-700',
            className: 'bg-blue-700',
            textClassName: 'text-blue-50',
          },
          {
            name: 'blue-800',
            className: 'bg-blue-800',
            textClassName: 'text-blue-50',
          },
          {
            name: 'blue-900',
            className: 'bg-blue-900',
            textClassName: 'text-blue-50',
          },
          {
            name: 'blue-950',
            className: 'bg-blue-950',
            textClassName: 'text-blue-50',
          },
        ],
      },
      {
        title: 'Indigo',
        items: [
          {
            name: 'indigo-50',
            className: 'bg-indigo-50',
            textClassName: 'text-indigo-900',
          },
          {
            name: 'indigo-100',
            className: 'bg-indigo-100',
            textClassName: 'text-indigo-900',
          },
          {
            name: 'indigo-200',
            className: 'bg-indigo-200',
            textClassName: 'text-indigo-900',
          },
          {
            name: 'indigo-300',
            className: 'bg-indigo-300',
            textClassName: 'text-indigo-900',
          },
          {
            name: 'indigo-400',
            className: 'bg-indigo-400',
            textClassName: 'text-indigo-900',
          },
          {
            name: 'indigo-500',
            className: 'bg-indigo-500',
            textClassName: 'text-indigo-50',
          },
          {
            name: 'indigo-600',
            className: 'bg-indigo-600',
            textClassName: 'text-indigo-50',
          },
          {
            name: 'indigo-700',
            className: 'bg-indigo-700',
            textClassName: 'text-indigo-50',
          },
          {
            name: 'indigo-800',
            className: 'bg-indigo-800',
            textClassName: 'text-indigo-50',
          },
          {
            name: 'indigo-900',
            className: 'bg-indigo-900',
            textClassName: 'text-indigo-50',
          },
          {
            name: 'indigo-950',
            className: 'bg-indigo-950',
            textClassName: 'text-indigo-50',
          },
        ],
      },
      {
        title: 'Violet',
        items: [
          {
            name: 'violet-50',
            className: 'bg-violet-50',
            textClassName: 'text-violet-900',
          },
          {
            name: 'violet-100',
            className: 'bg-violet-100',
            textClassName: 'text-violet-900',
          },
          {
            name: 'violet-200',
            className: 'bg-violet-200',
            textClassName: 'text-violet-900',
          },
          {
            name: 'violet-300',
            className: 'bg-violet-300',
            textClassName: 'text-violet-900',
          },
          {
            name: 'violet-400',
            className: 'bg-violet-400',
            textClassName: 'text-violet-900',
          },
          {
            name: 'violet-500',
            className: 'bg-violet-500',
            textClassName: 'text-violet-50',
          },
          {
            name: 'violet-600',
            className: 'bg-violet-600',
            textClassName: 'text-violet-50',
          },
          {
            name: 'violet-700',
            className: 'bg-violet-700',
            textClassName: 'text-violet-50',
          },
          {
            name: 'violet-800',
            className: 'bg-violet-800',
            textClassName: 'text-violet-50',
          },
          {
            name: 'violet-900',
            className: 'bg-violet-900',
            textClassName: 'text-violet-50',
          },
          {
            name: 'violet-950',
            className: 'bg-violet-950',
            textClassName: 'text-violet-50',
          },
        ],
      },
      {
        title: 'Purple',
        items: [
          {
            name: 'purple-50',
            className: 'bg-purple-50',
            textClassName: 'text-purple-900',
          },
          {
            name: 'purple-100',
            className: 'bg-purple-100',
            textClassName: 'text-purple-900',
          },
          {
            name: 'purple-200',
            className: 'bg-purple-200',
            textClassName: 'text-purple-900',
          },
          {
            name: 'purple-300',
            className: 'bg-purple-300',
            textClassName: 'text-purple-900',
          },
          {
            name: 'purple-400',
            className: 'bg-purple-400',
            textClassName: 'text-purple-900',
          },
          {
            name: 'purple-500',
            className: 'bg-purple-500',
            textClassName: 'text-purple-50',
          },
          {
            name: 'purple-600',
            className: 'bg-purple-600',
            textClassName: 'text-purple-50',
          },
          {
            name: 'purple-700',
            className: 'bg-purple-700',
            textClassName: 'text-purple-50',
          },
          {
            name: 'purple-800',
            className: 'bg-purple-800',
            textClassName: 'text-purple-50',
          },
          {
            name: 'purple-900',
            className: 'bg-purple-900',
            textClassName: 'text-purple-50',
          },
          {
            name: 'purple-950',
            className: 'bg-purple-950',
            textClassName: 'text-purple-50',
          },
        ],
      },
      {
        title: 'Fuchsia',
        items: [
          {
            name: 'fuchsia-50',
            className: 'bg-fuchsia-50',
            textClassName: 'text-fuchsia-900',
          },
          {
            name: 'fuchsia-100',
            className: 'bg-fuchsia-100',
            textClassName: 'text-fuchsia-900',
          },
          {
            name: 'fuchsia-200',
            className: 'bg-fuchsia-200',
            textClassName: 'text-fuchsia-900',
          },
          {
            name: 'fuchsia-300',
            className: 'bg-fuchsia-300',
            textClassName: 'text-fuchsia-900',
          },
          {
            name: 'fuchsia-400',
            className: 'bg-fuchsia-400',
            textClassName: 'text-fuchsia-900',
          },
          {
            name: 'fuchsia-500',
            className: 'bg-fuchsia-500',
            textClassName: 'text-fuchsia-50',
          },
          {
            name: 'fuchsia-600',
            className: 'bg-fuchsia-600',
            textClassName: 'text-fuchsia-50',
          },
          {
            name: 'fuchsia-700',
            className: 'bg-fuchsia-700',
            textClassName: 'text-fuchsia-50',
          },
          {
            name: 'fuchsia-800',
            className: 'bg-fuchsia-800',
            textClassName: 'text-fuchsia-50',
          },
          {
            name: 'fuchsia-900',
            className: 'bg-fuchsia-900',
            textClassName: 'text-fuchsia-50',
          },
          {
            name: 'fuchsia-950',
            className: 'bg-fuchsia-950',
            textClassName: 'text-fuchsia-50',
          },
        ],
      },
      {
        title: 'Pink',
        items: [
          {
            name: 'pink-50',
            className: 'bg-pink-50',
            textClassName: 'text-pink-900',
          },
          {
            name: 'pink-100',
            className: 'bg-pink-100',
            textClassName: 'text-pink-900',
          },
          {
            name: 'pink-200',
            className: 'bg-pink-200',
            textClassName: 'text-pink-900',
          },
          {
            name: 'pink-300',
            className: 'bg-pink-300',
            textClassName: 'text-pink-900',
          },
          {
            name: 'pink-400',
            className: 'bg-pink-400',
            textClassName: 'text-pink-900',
          },
          {
            name: 'pink-500',
            className: 'bg-pink-500',
            textClassName: 'text-pink-50',
          },
          {
            name: 'pink-600',
            className: 'bg-pink-600',
            textClassName: 'text-pink-50',
          },
          {
            name: 'pink-700',
            className: 'bg-pink-700',
            textClassName: 'text-pink-50',
          },
          {
            name: 'pink-800',
            className: 'bg-pink-800',
            textClassName: 'text-pink-50',
          },
          {
            name: 'pink-900',
            className: 'bg-pink-900',
            textClassName: 'text-pink-50',
          },
          {
            name: 'pink-950',
            className: 'bg-pink-950',
            textClassName: 'text-pink-50',
          },
        ],
      },
      {
        title: 'Rose',
        items: [
          {
            name: 'rose-50',
            className: 'bg-rose-50',
            textClassName: 'text-rose-900',
          },
          {
            name: 'rose-100',
            className: 'bg-rose-100',
            textClassName: 'text-rose-900',
          },
          {
            name: 'rose-200',
            className: 'bg-rose-200',
            textClassName: 'text-rose-900',
          },
          {
            name: 'rose-300',
            className: 'bg-rose-300',
            textClassName: 'text-rose-900',
          },
          {
            name: 'rose-400',
            className: 'bg-rose-400',
            textClassName: 'text-rose-900',
          },
          {
            name: 'rose-500',
            className: 'bg-rose-500',
            textClassName: 'text-rose-50',
          },
          {
            name: 'rose-600',
            className: 'bg-rose-600',
            textClassName: 'text-rose-50',
          },
          {
            name: 'rose-700',
            className: 'bg-rose-700',
            textClassName: 'text-rose-50',
          },
          {
            name: 'rose-800',
            className: 'bg-rose-800',
            textClassName: 'text-rose-50',
          },
          {
            name: 'rose-900',
            className: 'bg-rose-900',
            textClassName: 'text-rose-50',
          },
          {
            name: 'rose-950',
            className: 'bg-rose-950',
            textClassName: 'text-rose-50',
          },
        ],
      },
      {
        title: 'Slate',
        items: [
          {
            name: 'slate-50',
            className: 'bg-slate-50',
            textClassName: 'text-slate-900',
          },
          {
            name: 'slate-100',
            className: 'bg-slate-100',
            textClassName: 'text-slate-900',
          },
          {
            name: 'slate-200',
            className: 'bg-slate-200',
            textClassName: 'text-slate-900',
          },
          {
            name: 'slate-300',
            className: 'bg-slate-300',
            textClassName: 'text-slate-900',
          },
          {
            name: 'slate-400',
            className: 'bg-slate-400',
            textClassName: 'text-slate-900',
          },
          {
            name: 'slate-500',
            className: 'bg-slate-500',
            textClassName: 'text-slate-50',
          },
          {
            name: 'slate-600',
            className: 'bg-slate-600',
            textClassName: 'text-slate-50',
          },
          {
            name: 'slate-700',
            className: 'bg-slate-700',
            textClassName: 'text-slate-50',
          },
          {
            name: 'slate-800',
            className: 'bg-slate-800',
            textClassName: 'text-slate-50',
          },
          {
            name: 'slate-900',
            className: 'bg-slate-900',
            textClassName: 'text-slate-50',
          },
          {
            name: 'slate-950',
            className: 'bg-slate-950',
            textClassName: 'text-slate-50',
          },
        ],
      },
      {
        title: 'Gray',
        items: [
          {
            name: 'gray-50',
            className: 'bg-gray-50',
            textClassName: 'text-gray-900',
          },
          {
            name: 'gray-100',
            className: 'bg-gray-100',
            textClassName: 'text-gray-900',
          },
          {
            name: 'gray-200',
            className: 'bg-gray-200',
            textClassName: 'text-gray-900',
          },
          {
            name: 'gray-300',
            className: 'bg-gray-300',
            textClassName: 'text-gray-900',
          },
          {
            name: 'gray-400',
            className: 'bg-gray-400',
            textClassName: 'text-gray-900',
          },
          {
            name: 'gray-500',
            className: 'bg-gray-500',
            textClassName: 'text-gray-50',
          },
          {
            name: 'gray-600',
            className: 'bg-gray-600',
            textClassName: 'text-gray-50',
          },
          {
            name: 'gray-700',
            className: 'bg-gray-700',
            textClassName: 'text-gray-50',
          },
          {
            name: 'gray-800',
            className: 'bg-gray-800',
            textClassName: 'text-gray-50',
          },
          {
            name: 'gray-900',
            className: 'bg-gray-900',
            textClassName: 'text-gray-50',
          },
          {
            name: 'gray-950',
            className: 'bg-gray-950',
            textClassName: 'text-gray-50',
          },
        ],
      },
      {
        title: 'Zinc',
        items: [
          {
            name: 'zinc-50',
            className: 'bg-zinc-50',
            textClassName: 'text-zinc-900',
          },
          {
            name: 'zinc-100',
            className: 'bg-zinc-100',
            textClassName: 'text-zinc-900',
          },
          {
            name: 'zinc-200',
            className: 'bg-zinc-200',
            textClassName: 'text-zinc-900',
          },
          {
            name: 'zinc-300',
            className: 'bg-zinc-300',
            textClassName: 'text-zinc-900',
          },
          {
            name: 'zinc-400',
            className: 'bg-zinc-400',
            textClassName: 'text-zinc-900',
          },
          {
            name: 'zinc-500',
            className: 'bg-zinc-500',
            textClassName: 'text-zinc-50',
          },
          {
            name: 'zinc-600',
            className: 'bg-zinc-600',
            textClassName: 'text-zinc-50',
          },
          {
            name: 'zinc-700',
            className: 'bg-zinc-700',
            textClassName: 'text-zinc-50',
          },
          {
            name: 'zinc-800',
            className: 'bg-zinc-800',
            textClassName: 'text-zinc-50',
          },
          {
            name: 'zinc-900',
            className: 'bg-zinc-900',
            textClassName: 'text-zinc-50',
          },
          {
            name: 'zinc-950',
            className: 'bg-zinc-950',
            textClassName: 'text-zinc-50',
          },
        ],
      },
      {
        title: 'Neutral',
        items: [
          {
            name: 'neutral-50',
            className: 'bg-neutral-50',
            textClassName: 'text-neutral-900',
          },
          {
            name: 'neutral-100',
            className: 'bg-neutral-100',
            textClassName: 'text-neutral-900',
          },
          {
            name: 'neutral-200',
            className: 'bg-neutral-200',
            textClassName: 'text-neutral-900',
          },
          {
            name: 'neutral-300',
            className: 'bg-neutral-300',
            textClassName: 'text-neutral-900',
          },
          {
            name: 'neutral-400',
            className: 'bg-neutral-400',
            textClassName: 'text-neutral-900',
          },
          {
            name: 'neutral-500',
            className: 'bg-neutral-500',
            textClassName: 'text-neutral-50',
          },
          {
            name: 'neutral-600',
            className: 'bg-neutral-600',
            textClassName: 'text-neutral-50',
          },
          {
            name: 'neutral-700',
            className: 'bg-neutral-700',
            textClassName: 'text-neutral-50',
          },
          {
            name: 'neutral-800',
            className: 'bg-neutral-800',
            textClassName: 'text-neutral-50',
          },
          {
            name: 'neutral-900',
            className: 'bg-neutral-900',
            textClassName: 'text-neutral-50',
          },
          {
            name: 'neutral-950',
            className: 'bg-neutral-950',
            textClassName: 'text-neutral-50',
          },
        ],
      },
      {
        title: 'Stone',
        items: [
          {
            name: 'stone-50',
            className: 'bg-stone-50',
            textClassName: 'text-stone-900',
          },
          {
            name: 'stone-100',
            className: 'bg-stone-100',
            textClassName: 'text-stone-900',
          },
          {
            name: 'stone-200',
            className: 'bg-stone-200',
            textClassName: 'text-stone-900',
          },
          {
            name: 'stone-300',
            className: 'bg-stone-300',
            textClassName: 'text-stone-900',
          },
          {
            name: 'stone-400',
            className: 'bg-stone-400',
            textClassName: 'text-stone-900',
          },
          {
            name: 'stone-500',
            className: 'bg-stone-500',
            textClassName: 'text-stone-50',
          },
          {
            name: 'stone-600',
            className: 'bg-stone-600',
            textClassName: 'text-stone-50',
          },
          {
            name: 'stone-700',
            className: 'bg-stone-700',
            textClassName: 'text-stone-50',
          },
          {
            name: 'stone-800',
            className: 'bg-stone-800',
            textClassName: 'text-stone-50',
          },
          {
            name: 'stone-900',
            className: 'bg-stone-900',
            textClassName: 'text-stone-50',
          },
          {
            name: 'stone-950',
            className: 'bg-stone-950',
            textClassName: 'text-stone-50',
          },
        ],
      },
    ],
  },
};

export const SemanticColors: Story = {
  args: {
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
