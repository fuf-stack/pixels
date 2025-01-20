import type { VariantProps } from '@heroui/theme';
import type { ClassProp, TV } from 'tailwind-variants';

import { tv as tailwindVariants } from 'tailwind-variants';

/**
 * Represents a class value which can be either a string or an array of strings
 * Used for handling both single class names and multiple class names
 */
export type ClassValue = string | string[];

/**
 * Props accepted by tailwind-variants slot functions
 * Combines a dynamic record of string/number values with the ClassProp from tailwind-variants
 */
type TVSlotProps = {
  [x: string]: string | number | undefined;
  [x: number]: string | number | undefined;
} & ClassProp<ClassValue>;

/**
 * Represents a tailwind-variants slot function
 * Takes optional TVSlotProps and returns a string of class names
 */
type TVFunction = {
  (slotProps?: TVSlotProps | undefined): string;
};

/**
 * A record of slot names to their corresponding tailwind-variants functions
 * Used to type the variants parameter in variantsToClassNames
 */
type TVRecord = Record<string, TVFunction>;

/**
 * Re-export of tailwind-variants tv function
 * Used to create variant definitions with slots and variants
 */
export const tv: TV = tailwindVariants;

/**
 * Extracts variant props from a tailwind-variants component
 * Used for typing component props that use variants
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TVProps<Component extends (...args: any) => any> =
  VariantProps<Component>;

/**
 * Extracts className type from a tailwind-variants component
 * Can be either a partial record of slot names to class values, or a single class value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TVClassName<Component extends (...args: any) => any> =
  | Partial<Record<keyof ReturnType<Component>, ClassValue>>
  | ClassValue;

/**
 * Converts tailwind-variants slots instance to actual classnames object
 *
 * @param variants - Object containing slot variant functions from tailwind-variants
 * @param className - Optional class names to merge with variant classes. Can be string, array, or record
 * @param baseSlot - Optional slot name to apply global className to
 * @returns Record mapping slot names to their final class name strings
 *
 * @example
 * ```tsx
 * const variants = tv({ slots: { base: 'bg-white', content: 'p-4' } });
 * const classes = variantsToClassNames(variants(), 'shadow-lg', 'base');
 * // Result: { base: 'bg-white shadow-lg', content: 'p-4' }
 * ```
 *
 * @example
 * ```tsx
 * const variants = tv({ slots: { base: '', content: '' } });
 * const classes = variantsToClassNames(variants(), {
 *   base: 'bg-white',
 *   content: ['p-4', 'text-gray-700']
 * });
 * // Result: { base: 'bg-white', content: 'p-4 text-gray-700' }
 * ```
 */
export const variantsToClassNames = <T extends TVRecord>(
  variants: T,
  className?: ClassValue | Record<string, ClassValue>,
  baseSlot?: keyof T,
): Record<keyof T, string> => {
  const classNames =
    typeof className === 'object' && !Array.isArray(className) ? className : {};

  return Object.entries(variants).reduce(
    (acc, [slot, variantFn]) => {
      const slotKey = slot as keyof T;
      const slotClassName =
        typeof className === 'string' || Array.isArray(className)
          ? className
          : classNames[slot];

      // @ts-expect-error not sure here
      acc[slotKey] = variantFn({
        className:
          baseSlot && slot === baseSlot ? slotClassName : classNames[slot],
      });

      return acc;
    },
    {} as Record<keyof T, string>,
  );
};
