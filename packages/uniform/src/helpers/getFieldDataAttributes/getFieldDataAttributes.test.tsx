import { describe, expect, it, vi } from 'vitest';

import { render } from '@testing-library/react';

import getFieldDataAttributes from './getFieldDataAttributes';

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
