import { describe, expect, expectTypeOf, it } from 'vitest';

import { createStyling, defaultStyling } from './styling';
import { tv, variantsToClassNames } from './tv';

const bodyStyling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

describe('isolated styling instances', () => {
  it('preserves the existing semantic utility roles without a theme dependency', () => {
    expect(defaultStyling.cn('text-tiny text-danger', 'text-small')).toBe(
      'text-danger text-small',
    );
    expect(
      defaultStyling.cn('border-medium border-danger', 'border-small'),
    ).toBe('border-danger border-small');
    expect(
      defaultStyling.cn(
        'rounded-small shadow-small opacity-100',
        'rounded-medium shadow-large opacity-disabled',
      ),
    ).toBe('rounded-medium shadow-large opacity-disabled');
    expect(defaultStyling.cn('text-tiny text-danger', 'text-body')).toBe(
      'text-tiny text-body',
    );
  });

  it('copies configuration before lazy merging and later recipe creation', () => {
    const sizes = ['body'];
    const styling = createStyling({
      extend: { classGroups: { 'font-size': [{ text: sizes }] } },
    });
    sizes[0] = 'changed';
    expect(styling.cn('text-sm text-danger', 'text-body')).toBe(
      'text-danger text-body',
    );
    expect(
      styling.tv({ base: 'text-sm text-danger' })({ class: 'text-body' }),
    ).toBe('text-danger text-body');
    expect(Object.isFrozen(styling)).toBe(true);
  });

  it('preserves per-recipe merge opt-out and legacy configuration', () => {
    const unmerged = tv({ base: 'p-2' }, { twMerge: false });
    expect(unmerged({ class: 'p-4' })).toBe('p-2 p-4');
    const legacy = tv(
      { base: 'text-sm text-danger' },
      {
        twMergeConfig: { classGroups: { 'font-size': [{ text: ['body'] }] } },
      },
    );
    expect(legacy({ class: 'text-body' })).toBe('text-danger text-body');
    expect(tv({ base: 'text-sm text-danger' })({ class: 'text-body' })).toBe(
      'text-sm text-body',
    );
  });

  it('keeps color while replacing font size in all helpers', () => {
    const recipe = tv({ slots: { input: 'text-sm text-danger' } });
    expect(bodyStyling.cn('text-sm text-danger', 'text-body')).toBe(
      'text-danger text-body',
    );
    expect(
      variantsToClassNames(bodyStyling.resolve(recipe), { input: 'text-body' }),
    ).toEqual({ base: undefined, input: 'text-danger text-body' });
    expect(
      bodyStyling.tv({ base: 'text-sm text-danger' })({ class: 'text-body' }),
    ).toBe('text-danger text-body');
  });

  it('merges after compound variants and extension, without losing classes', () => {
    const base = tv({
      slots: { input: 'text-sm text-danger' },
      variants: { large: { true: { input: 'text-lg' } } },
      compoundVariants: [{ large: true, class: { input: 'text-body' } }],
      defaultVariants: { large: true },
    });
    const extended = tv({ extend: base, slots: { input: 'font-semibold' } });
    expect(bodyStyling.resolve(extended).input()).toBe(
      'text-danger font-semibold text-body',
    );
    expect(bodyStyling.resolve(base).input({ class: 'text-xl' })).toBe(
      'text-danger text-xl',
    );
  });

  it('handles responsive, state, important, arbitrary and unrelated classes', () => {
    expect(
      bodyStyling.cn(
        'md:text-sm hover:text-lg text-sm! text-[length:13px] text-danger editor',
        'md:text-body hover:text-body text-body! text-body',
      ),
    ).toBe(
      'text-danger editor md:text-body hover:text-body text-body! text-body',
    );
  });

  it('supports custom groups and directional conflicts', () => {
    const styling = createStyling({
      extend: {
        classGroups: { 'field-padding': ['field-padding'] },
        conflictingClassGroups: { 'field-padding': ['px', 'py', 'p'] },
      },
    });
    expect(styling.cn('px-2 py-4', 'field-padding')).toBe('field-padding');
    expect(styling.cn('field-padding', 'px-2')).toBe('field-padding px-2');
  });

  it('does not leak configuration through interleaved recipe calls', () => {
    const colorStyling = createStyling({
      extend: { classGroups: { 'text-color': [{ text: ['body'] }] } },
    });
    const body = bodyStyling.tv({ base: 'text-sm text-danger' });
    const color = colorStyling.tv({ base: 'text-sm text-danger' });
    for (let i = 0; i < 3; i += 1) {
      expect(body({ class: 'text-body' })).toBe('text-danger text-body');
      expect(color({ class: 'text-body' })).toBe('text-sm text-body');
      expect(defaultStyling.cn('text-sm text-danger', 'text-body')).toBe(
        'text-sm text-body',
      );
    }
  });

  it('preserves slot overrides, compound slots and variant inference', () => {
    const recipe = bodyStyling.tv({
      slots: { base: 'p-2', input: 'text-sm text-danger' },
      variants: { size: { sm: { base: 'p-1' }, lg: { base: 'p-4' } } },
      compoundSlots: [{ slots: ['input'], size: 'lg', class: 'text-body' }],
    });
    expectTypeOf<Parameters<typeof recipe>[0]>().toExtend<
      | {
          size?: 'sm' | 'lg';
        }
      | undefined
    >();
    const slots = bodyStyling.resolve(recipe, { size: 'lg' });
    expect(bodyStyling.variantsToClassNames(slots, ['p-6'], 'base').base).toBe(
      'p-6',
    );
    expect(slots.input()).toBe('text-danger text-body');
    expect(slots.input({ size: 'sm', className: 'text-xl' })).toBe(
      'text-danger text-xl',
    );
  });

  it('uses the prose rules consistently in defaults and configured recipes', () => {
    expect(
      tv({ base: 'prose-sm prose-slate' })({ class: 'prose-lg prose-blue' }),
    ).toBe('prose-lg prose-blue');
    expect(bodyStyling.cn('prose-sm prose-slate', 'prose-lg prose-blue')).toBe(
      'prose-lg prose-blue',
    );
  });
});
