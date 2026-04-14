import { describe, expect, it } from 'vitest';

import { cn } from './cn';

it('should return a single class when only one is provided', () => {
  expect(cn('text-center')).toBe('text-center');
});

it('should combine multiple class names', () => {
  expect(cn('text-center', 'p-4')).toBe('text-center p-4');
});

it('should handle conditional classes based on object input', () => {
  expect(cn({ 'text-center': true, 'p-4': false })).toBe('text-center');
});

it('should ignore falsy values like null, undefined, false', () => {
  expect(cn('text-center', null, undefined, false)).toBe('text-center');
});

it('should handle a combination of strings, arrays, and objects', () => {
  expect(
    cn('text-center', ['p-4', 'bg-red-500'], { 'p-2': true, 'm-2': false }),
  ).toBe('text-center bg-red-500 p-2');
});

it('should return an empty string when no valid class is provided', () => {
  expect(cn(null, undefined, false)).toBe('');
});

it('should merge complex Tailwind CSS conflicting classes', () => {
  expect(
    cn(
      'p-4', // padding 4
      'p-2', // padding 2 (should override p-4)
      'text-red-500', // red text color
      'text-blue-500', // blue text color (should override red)
      'bg-white', // white background
      'bg-black', // black background (should override white)
      'md:p-6', // padding 6 on medium screens
      'md:p-8', // padding 8 on medium screens (should override md:p-6)
      'hover:bg-gray-500', // hover background color gray
      'hover:bg-blue-500', // hover background color blue (should override hover:bg-gray-500)
      'font-bold', // bold font weight
      'font-light', // light font weight (should override font-bold)
    ),
  ).toBe('p-2 text-blue-500 bg-black md:p-8 hover:bg-blue-500 font-light');
});

describe('cn prose merge config', () => {
  it('should apply the shared prose merge config', () => {
    expect(cn('prose prose-slate dark:prose-invert', 'prose-blue')).toBe(
      'prose dark:prose-invert prose-blue',
    );
  });
});
