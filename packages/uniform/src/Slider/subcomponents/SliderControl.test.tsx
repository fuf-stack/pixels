import type * as Aria from 'react-aria-components';

import { describe, expect, it, vi } from 'vitest';

import { render } from '@testing-library/react';

import SliderControl from './SliderControl';

const engine = vi.hoisted(() => ({ commit: (_value: number) => {} }));
vi.mock('react-aria-components', async (importOriginal) => ({
  ...(await importOriginal<typeof Aria>()),
  Slider: ({ onChangeEnd }: { onChangeEnd: (value: number) => void }) => {
    engine.commit = onChangeEnd;
    return null;
  },
}));

const createField = () => ({
  ariaLabel: 'Standalone',
  customAriaLabel: undefined,
  defaultValue: undefined,
  description: undefined,
  disabled: false,
  error: undefined,
  errorMessage: null,
  hasErrors: false,
  hasLabel: true,
  ids: {
    control: 'standalone',
    label: 'label',
    description: 'description',
    error: 'error',
  },
  invalid: false,
  label: 'Standalone',
  name: 'standalone',
  onBlur: vi.fn(),
  onChange: vi.fn(),
  ref: vi.fn(),
  required: false,
  testId: 'standalone',
  value: 0,
});

describe('SliderControl interaction completion', () => {
  it.each([{ value: undefined }, { value: null }, { value: '' }])(
    'commits displayed zero when the stored value is $value',
    ({ value }) => {
      const field = createField();
      render(<SliderControl field={field} getCurrentValue={() => value} />);
      engine.commit(0);
      expect(field.onChange).toHaveBeenCalledExactlyOnceWith(0);
    },
  );

  it.each([0, 25, -5])('does not rewrite a stored value of %s', (value) => {
    const field = createField();
    render(<SliderControl field={field} getCurrentValue={() => value} />);
    engine.commit(value);
    expect(field.onChange).not.toHaveBeenCalled();
  });

  it('reads current storage at completion without needing a rerender', () => {
    const field = createField();
    const getCurrentValue = vi.fn<() => unknown>(() => undefined);
    render(<SliderControl field={field} getCurrentValue={getCurrentValue} />);

    getCurrentValue.mockReturnValue(40);
    engine.commit(40);
    expect(field.onChange).not.toHaveBeenCalled();

    getCurrentValue.mockReturnValue(null);
    engine.commit(10);
    expect(field.onChange).toHaveBeenCalledExactlyOnceWith(10);
  });
});
