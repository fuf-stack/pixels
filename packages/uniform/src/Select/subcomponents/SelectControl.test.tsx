import { describe, expect, it, vi } from 'vitest';

import { render } from '@testing-library/react';

import SelectControl from './SelectControl';

const engine = vi.hoisted(() => ({ change: (_value: unknown) => {} }));
vi.mock('react-select', () => ({
  components: {},
  default: ({ onChange }: { onChange: (value: unknown) => void }) => {
    engine.change = onChange;
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

describe('SelectControl selection timing', () => {
  it.each([
    { option: { value: '2' }, multiSelect: false, expected: 2 },
    { option: [{ value: '2' }], multiSelect: true, expected: [2] },
    { option: null, multiSelect: false, expected: null },
  ])(
    'commits $expected before marking the field touched',
    async ({ option, multiSelect, expected }) => {
      const field = createField();
      const getIsTouched = vi.fn(() => false);
      render(
        <SelectControl
          field={field}
          getIsTouched={getIsTouched}
          multiSelect={multiSelect}
          options={[{ label: 'Two', value: 2 }]}
        />,
      );

      engine.change(option);
      expect(field.onChange).toHaveBeenCalledExactlyOnceWith(expected);
      expect(field.onBlur).not.toHaveBeenCalled();
      expect(field.onChange.mock.invocationCallOrder[0]).toBeLessThan(
        getIsTouched.mock.invocationCallOrder[0],
      );

      await Promise.resolve();
      expect(field.onBlur).toHaveBeenCalledOnce();
    },
  );

  it('reads current touched state without repeating the touched update', async () => {
    const field = createField();
    const getIsTouched = vi.fn(() => false);
    render(
      <SelectControl
        field={field}
        getIsTouched={getIsTouched}
        options={[{ label: 'Two', value: 2 }]}
      />,
    );

    engine.change({ value: '2' });
    await Promise.resolve();
    expect(field.onBlur).toHaveBeenCalledOnce();

    getIsTouched.mockReturnValue(true);
    engine.change(null);
    await Promise.resolve();
    expect(field.onChange).toHaveBeenLastCalledWith(null);
    expect(field.onBlur).toHaveBeenCalledOnce();
  });
});
