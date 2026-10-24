import type { TV, VariantProps } from 'tailwind-variants';

import { defaultStyling } from './styling';

/**
 * Represents a class value which can be either a string or an array of strings
 * Used for handling both single class names and multiple class names
 */
export type ClassValue = string | string[];

/**
 * Tailwind Variants recipe factory with isolated semantic class merging
 * Used to create variant definitions with slots and variants
 */
export const tv: TV = defaultStyling.tv;

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
  Partial<Record<keyof ReturnType<Component>, ClassValue>> | ClassValue;

export { default as variantsToClassNames } from './slotClassNames';
