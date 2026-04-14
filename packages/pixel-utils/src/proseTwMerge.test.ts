import { describe, expect, it } from 'vitest';

import { proseTwMerge, proseTwMergeClassGroups } from './proseTwMerge';

describe('proseTwMergeClassGroups', () => {
  it('registers prose size and color groups', () => {
    expect(Object.keys(proseTwMergeClassGroups)).toEqual([
      'prose-size',
      'prose-color',
    ]);
  });
});

describe('proseTwMerge', () => {
  it('merges conflicting prose size classes', () => {
    expect(proseTwMerge('prose prose-lg prose-xl')).toBe('prose prose-xl');
  });

  it('merges conflicting prose color classes', () => {
    expect(proseTwMerge('prose prose-slate prose-blue')).toBe(
      'prose prose-blue',
    );
  });

  it('preserves prose-invert while merging prose colors', () => {
    expect(proseTwMerge('prose prose-slate dark:prose-invert prose-blue')).toBe(
      'prose dark:prose-invert prose-blue',
    );
  });

  it('supports arbitrary prose colors', () => {
    expect(proseTwMerge('prose prose-slate prose-[#333333]')).toBe(
      'prose prose-[#333333]',
    );
  });

  it('supports custom prose color tokens', () => {
    expect(proseTwMerge('prose prose-slate prose-warning')).toBe(
      'prose prose-warning',
    );
  });

  it('keeps modifier-scoped prose colors independent from base prose colors', () => {
    expect(
      proseTwMerge(
        'prose prose-slate dark:prose-stone prose-blue dark:prose-zinc',
      ),
    ).toBe('prose prose-blue dark:prose-zinc');
  });

  it('merges conflicting prose link modifiers', () => {
    expect(proseTwMerge('prose prose-a:no-underline prose-a:underline')).toBe(
      'prose prose-a:underline',
    );
  });
});
