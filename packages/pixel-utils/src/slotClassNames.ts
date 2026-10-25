import type { ClassProp } from 'tailwind-variants';
import type { ClassValue } from './tv';

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
type TVFunction = (slotProps?: TVSlotProps) => string;

/**
 * A record of slot names to their corresponding tailwind-variants functions
 * Used to type the variants parameter in variantsToClassNames
 */
type TVRecord = Record<string, TVFunction>;

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
const variantsToClassNames = <T extends TVRecord>(
  variants: T,
  className?: ClassValue | Record<string, ClassValue | undefined>,
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

export default variantsToClassNames;
