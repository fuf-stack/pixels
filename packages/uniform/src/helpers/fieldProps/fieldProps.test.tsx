import { describe, expect, it, vi } from 'vitest';

import { render } from '@testing-library/react';

import { getFieldControlProps, getFieldDataAttributes } from './fieldProps';

describe('Field state attributes in the DOM', () => {
  it.each([
    { disabled: false, invalid: false, required: false, expected: [] },
    {
      disabled: true,
      invalid: false,
      required: false,
      expected: ['data-disabled'],
    },
    {
      disabled: false,
      invalid: true,
      required: false,
      expected: ['data-invalid'],
    },
    {
      disabled: false,
      invalid: false,
      required: true,
      expected: ['data-required'],
    },
    {
      disabled: true,
      invalid: true,
      required: false,
      expected: ['data-disabled', 'data-invalid'],
    },
    {
      disabled: true,
      invalid: false,
      required: true,
      expected: ['data-disabled', 'data-required'],
    },
    {
      disabled: false,
      invalid: true,
      required: true,
      expected: ['data-invalid', 'data-required'],
    },
    {
      disabled: true,
      invalid: true,
      required: true,
      expected: ['data-disabled', 'data-invalid', 'data-required'],
    },
  ])(
    'renders only active flags for disabled=$disabled, invalid=$invalid, required=$required',
    ({ disabled, invalid, required, expected }) => {
      const { container } = render(
        <div {...getFieldDataAttributes({ disabled, invalid, required })} />,
      );
      const element = container.firstElementChild as HTMLElement;

      expect(element.getAttributeNames().sort()).toEqual(expected);
      expect(
        Array.from(element.attributes, (attribute) => attribute.value),
      ).toEqual(expected.map(() => 'true'));
    },
  );

  it.each([
    {},
    { disabled: undefined, invalid: undefined, required: undefined },
  ])('omits unspecified flags for %j', (state) => {
    const { container } = render(<div {...getFieldDataAttributes(state)} />);

    expect(container.firstElementChild?.getAttributeNames()).toEqual([]);
  });

  it('removes stale attributes when state becomes inactive without replacing the element', () => {
    const { container, rerender } = render(
      <div
        {...getFieldDataAttributes({
          disabled: true,
          invalid: true,
          required: true,
        })}
      />,
    );
    const element = container.firstElementChild;

    rerender(
      <div
        {...getFieldDataAttributes({
          disabled: false,
          invalid: false,
          required: false,
        })}
      />,
    );

    expect(container.firstElementChild).toBe(element);
    expect(element?.getAttributeNames()).toEqual([]);
  });
});

describe('Styling-only boundary', () => {
  it('does not forward unrelated field props or mutate the supplied state', () => {
    const onBlur = vi.fn();
    const state = Object.freeze({
      disabled: true,
      invalid: false,
      required: false,
      name: 'email',
      id: 'email-control',
      'aria-required': true,
      onBlur,
    });
    const attributes = getFieldDataAttributes(state);

    expect(Object.keys(attributes).sort()).toEqual([
      'data-disabled',
      'data-invalid',
      'data-required',
    ]);
    expect(attributes).not.toHaveProperty('name');
    expect(attributes).not.toHaveProperty('id');
    expect(attributes).not.toHaveProperty('aria-required');
    expect(attributes).not.toHaveProperty('onBlur');
    expect(state).toMatchObject({
      disabled: true,
      invalid: false,
      required: false,
    });
    expect(onBlur).not.toHaveBeenCalled();
  });
});

const fieldState = {
  ariaLabel: 'Email',
  customAriaLabel: undefined,
  description: undefined,
  hasErrors: false,
  hasLabel: false,
  ids: {
    control: 'email',
    description: 'email-description',
    error: 'email-error',
    label: 'email-label',
  },
  invalid: false,
  required: false,
};

describe('Control associations', () => {
  it.each([
    {
      hasLabel: false,
      customAriaLabel: undefined,
      ariaLabel: 'Email',
      labelledBy: undefined,
    },
    {
      hasLabel: true,
      customAriaLabel: undefined,
      ariaLabel: undefined,
      labelledBy: 'email-label',
    },
    {
      hasLabel: true,
      customAriaLabel: 'Work email',
      ariaLabel: 'Work email',
      labelledBy: undefined,
    },
    {
      hasLabel: false,
      customAriaLabel: 'Work email',
      ariaLabel: 'Work email',
      labelledBy: undefined,
    },
  ])(
    'resolves names for label=$hasLabel and override=$customAriaLabel',
    ({ hasLabel, customAriaLabel, ariaLabel, labelledBy }) => {
      const props = getFieldControlProps({
        ...fieldState,
        hasLabel,
        customAriaLabel,
      });

      expect(props['aria-label']).toBe(ariaLabel);
      expect(props['aria-labelledby']).toBe(labelledBy);
    },
  );

  it.each([
    {
      description: undefined,
      invalid: false,
      hasErrors: false,
      expected: undefined,
    },
    {
      description: 'Help',
      invalid: false,
      hasErrors: false,
      expected: 'email-description',
    },
    {
      description: 'Help',
      invalid: false,
      hasErrors: true,
      expected: 'email-description',
    },
    {
      description: 'Help',
      invalid: true,
      hasErrors: false,
      expected: 'email-description',
    },
    {
      description: undefined,
      invalid: true,
      hasErrors: true,
      expected: 'email-error',
    },
    {
      description: 'Help',
      invalid: true,
      hasErrors: true,
      expected: 'email-description email-error',
    },
  ])('references rendered messages for %j', ({ expected, ...state }) => {
    expect(
      getFieldControlProps({ ...fieldState, ...state })['aria-describedby'],
    ).toBe(expected);
  });

  it('removes stale associations and state flags on the same input', () => {
    const { container, rerender } = render(
      <input
        {...getFieldControlProps({
          ...fieldState,
          description: 'Help',
          hasErrors: true,
          invalid: true,
          required: true,
        })}
      />,
    );
    const input = container.firstElementChild;

    expect(input).toHaveAttribute(
      'aria-describedby',
      'email-description email-error',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');

    rerender(<input {...getFieldControlProps(fieldState)} />);

    expect(container.firstElementChild).toBe(input);
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-required');
  });

  it('ignores debug label content and unrelated field data', () => {
    const state = Object.freeze({
      ...fieldState,
      label: <button type="button">Copy test ID</button>,
      value: 'private value',
      onChange: vi.fn(),
      disabled: true,
    });
    const props = getFieldControlProps(state);

    expect(props).toEqual({
      id: 'email',
      'aria-label': 'Email',
      'aria-labelledby': undefined,
      'aria-describedby': undefined,
      'aria-invalid': undefined,
      'aria-required': undefined,
    });
    expect(state.onChange).not.toHaveBeenCalled();
  });
});
