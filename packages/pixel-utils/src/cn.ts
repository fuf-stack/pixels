/* eslint-disable import-x/prefer-default-export */
import type { ArgumentArray } from 'classnames';

import classNames from 'classnames';

import { proseTwMerge } from './proseTwMerge';

/**
 * A utility function that combines `classnames` and `tailwind-merge`.
 *
 * It takes multiple class values (strings, arrays, or objects), merges them,
 * and ensures Tailwind CSS classes are handled properly by resolving conflicts.
 *
 * @param classes - A list of class names that can be strings, objects, or arrays.
 * @returns A string of combined class names with Tailwind CSS conflict resolution.
 *
 * Example usage:
 * ```
 * cn('p-4', 'text-center', { 'bg-red-500': true, 'p-2': false });
 * // Output: 'text-center bg-red-500 p-4'
 * ```
 */
export const cn = (...classes: ArgumentArray) => {
  // First, `classnames` merges the input class names (conditionally if needed).
  // Then, the shared prose-aware `tailwind-merge` instance resolves conflicts.
  return proseTwMerge(classNames(...classes)) as unknown as string;
};
