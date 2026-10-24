import { describe, expect, it } from 'vitest';

import { tv, variantsToClassNames } from './tv';

describe('variantsToClassNames with tv', () => {
  it('should convert simple variants to classnames without className or baseSlot', () => {
    const variants = tv({
      slots: {
        base: '',
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });
    const result = variantsToClassNames(variants());
    expect(result).toEqual({
      base: undefined,
      slot1: 'p-4', // padding 4 applied
      slot2: 'text-center', // text center applied
    });
  });

  it('should merge global className only when baseSlot is defined', () => {
    const variants = tv({
      slots: {
        base: '',
        slot1: 'p-4',
        slot2: 'text-center',
      },
    });

    // Define baseSlot as 'base' and global className
    const result = variantsToClassNames(variants(), 'shadow-lg', 'base');
    expect(result).toEqual({
      base: 'shadow-lg', // 'shadow-lg' applied to base slot
      slot1: 'p-4', // slot1 remains unchanged
      slot2: 'text-center', // slot2 remains unchanged
    });
  });

  it('should dismiss global className when baseSlot is not defined', () => {
    const variants = tv({
      slots: {
        base: '',
        slot1: 'p-4',
        slot2: 'text-center',
      },
    });

    // Global className but no baseSlot defined
    const result = variantsToClassNames(variants(), 'shadow-lg');
    expect(result).toEqual({
      base: undefined, // No global className applied, empty slot
      slot1: 'p-4', // slot1 remains unchanged
      slot2: 'text-center', // slot2 remains unchanged
    });
  });

  it('should handle className as an object for specific slots', () => {
    const variants = tv({
      slots: {
        base: '',
        slot1: 'p-4',
        slot2: 'text-center',
      },
    });

    const classNameObj = {
      slot1: 'text-red-500', // Tailwind text color class
      slot2: 'bg-blue-500', // Tailwind background color class
    };

    const result = variantsToClassNames(variants(), classNameObj);
    expect(result).toEqual({
      base: undefined,
      slot1: 'p-4 text-red-500', // 'p-4' + 'text-red-500' merged
      slot2: 'text-center bg-blue-500', // 'text-center' + 'bg-blue-500' merged
    });
  });

  it('preserves slot defaults when an override is undefined', () => {
    const recipe = tv({
      slots: {
        label: 'text-sm text-foreground',
        wrapper: 'border-2',
      },
    });

    expect(
      variantsToClassNames(recipe(), {
        label: undefined,
        wrapper: 'border-danger',
      }),
    ).toEqual({
      label: 'text-sm text-foreground',
      wrapper: 'border-2 border-danger',
    });
  });

  it('should apply baseSlot logic with tv variants', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Tailwind background color class
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    const result = variantsToClassNames(variants(), 'border', 'base'); // A valid Tailwind class (border)
    expect(result).toEqual({
      base: 'bg-white border', // 'bg-white' + 'border' merged
      slot1: 'p-4', // padding 4 remains in slot1
      slot2: 'text-center', // text-center remains in slot2
    });
  });

  it('should handle both baseSlot and className object with tv variants', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Tailwind background class
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    const classNameObj = {
      base: 'shadow-md', // Tailwind shadow class
      slot1: 'text-blue-500', // Tailwind text color class
    };

    const result = variantsToClassNames(variants(), classNameObj, 'base');
    expect(result).toEqual({
      base: 'bg-white shadow-md', // 'bg-white' + 'shadow-md' merged
      slot1: 'p-4 text-blue-500', // 'p-4' + 'text-blue-500' merged
      slot2: 'text-center', // Default Tailwind class for slot2 remains
    });
  });

  it('should handle array className for specific slots', () => {
    const variants = tv({
      slots: {
        base: '', // Empty base slot
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    const classNameObj = {
      slot1: ['text-red-500', 'hover:text-red-600'], // Text color with hover state
      slot2: ['bg-blue-500', 'hover:bg-blue-600'], // Background color with hover state
    };

    const result = variantsToClassNames(variants(), classNameObj);
    expect(result).toEqual({
      base: undefined,
      slot1: 'p-4 text-red-500 hover:text-red-600', // Default padding + text color + hover state
      slot2: 'text-center bg-blue-500 hover:bg-blue-600', // Default alignment + bg color + hover state
    });
  });

  it('should handle array className with baseSlot', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Default white background
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    // Array of classes targeting the base slot
    const result = variantsToClassNames(
      variants(),
      ['border', 'hover:border-blue-500'], // Border with hover state
      'base',
    );
    expect(result).toEqual({
      base: 'bg-white border hover:border-blue-500', // Default bg + border classes merged
      slot1: 'p-4', // Padding remains unchanged
      slot2: 'text-center', // Alignment remains unchanged
    });
  });

  it('should handle mixed array and string classNames', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Default white background
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    const classNameObj = {
      base: ['shadow-md', 'hover:shadow-lg'], // Shadow with hover state
      slot1: 'text-blue-500', // Single text color class
      slot2: ['bg-gray-100', 'hover:bg-gray-200', 'dark:bg-gray-800'], // Background with hover and dark mode
    };

    const result = variantsToClassNames(variants(), classNameObj, 'base');
    expect(result).toEqual({
      base: 'bg-white shadow-md hover:shadow-lg', // Default bg + shadow classes merged
      slot1: 'p-4 text-blue-500', // Default padding + text color
      slot2: 'text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800', // All classes merged correctly
    });
  });

  it('should handle complex responsive and state variants in arrays', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Default white background
        slot1: 'p-4', // Default padding
        slot2: 'text-center', // Default text alignment
      },
    });

    const classNameObj = {
      base: [
        'sm:bg-gray-100', // Small screen background
        'md:bg-gray-200', // Medium screen background
        'lg:bg-gray-300', // Large screen background
        'hover:bg-blue-100', // Hover state background
        'dark:bg-gray-800', // Dark mode background
      ],
      slot1: [
        'sm:p-2', // Small screen padding
        'md:p-4', // Medium screen padding
        'lg:p-6', // Large screen padding
        'hover:scale-105', // Hover scale effect
        'active:scale-95', // Active state scale effect
      ],
      slot2: [
        'sm:text-left', // Small screen alignment
        'md:text-center', // Medium screen alignment
        'lg:text-right', // Large screen alignment
        'dark:text-white', // Dark mode text color
      ],
    };

    const result = variantsToClassNames(variants(), classNameObj);
    expect(result).toEqual({
      base: 'bg-white sm:bg-gray-100 md:bg-gray-200 lg:bg-gray-300 hover:bg-blue-100 dark:bg-gray-800', // Responsive backgrounds merged
      slot1: 'p-4 sm:p-2 md:p-4 lg:p-6 hover:scale-105 active:scale-95', // Responsive padding and interactions merged
      slot2:
        'text-center sm:text-left md:text-center lg:text-right dark:text-white', // Responsive alignment merged
    });
  });

  it('should handle empty arrays in className object', () => {
    const variants = tv({
      slots: {
        base: 'bg-white', // Default white background
        slot1: 'p-4', // Tailwind padding class
        slot2: 'text-center', // Tailwind text alignment class
      },
    });

    const classNameObj = {
      base: [], // Empty array should not affect default classes
      slot1: ['text-blue-500'], // Single class in array
      slot2: [], // Empty array should not affect default classes
    };

    const result = variantsToClassNames(variants(), classNameObj);
    expect(result).toEqual({
      base: 'bg-white', // Default background preserved
      slot1: 'p-4 text-blue-500', // Default padding + new text color
      slot2: 'text-center', // Default alignment preserved
    });
  });
});
