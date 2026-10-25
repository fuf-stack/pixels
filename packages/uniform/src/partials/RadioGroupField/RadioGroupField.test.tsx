import type { ComponentProps } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { Label } from 'react-aria-components';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { variantsToClassNames } from '@fuf-stack/pixel-utils';

import RadioControl from '../../Radios/subcomponents/RadioControl';
import radioControlVariants from '../../Radios/subcomponents/radioControlVariants';
import FieldLayout from '../FieldLayout/FieldLayout';
import RadioGroupField from './RadioGroupField';
import * as stories from './stories/RadioGroupField.stories';

const ids = {
  control: 'delivery',
  label: 'delivery-label',
  description: 'delivery-description',
  error: 'delivery-error',
};
const variants = radioControlVariants();
const classNames = variantsToClassNames(variants);
const bindings = () => ({
  controlProps: { id: ids.control },
  inline: false,
  inputRef: vi.fn<(control: Pick<HTMLElement, 'focus'> | null) => void>(),
  invalid: false,
  name: 'delivery',
  onBlur: vi.fn(),
  onChange: vi.fn(),
  required: false,
  testId: 'delivery',
  value: 'post',
});
const renderField = (
  props: Omit<ComponentProps<typeof RadioGroupField>, 'children'>,
) => {
  const { invalid } = props;
  return (
    <FieldLayout
      baseAs={RadioGroupField}
      baseProps={props}
      className={{}}
      description="Choose a method"
      errorMessage="Unavailable"
      ids={ids}
      invalid={invalid}
      label="Delivery"
      labelAs={Label}
    >
      <RadioControl
        className={classNames}
        description="Sent to your inbox"
        invalid={invalid}
        value="email"
      >
        Email
      </RadioControl>
      <RadioControl
        className={classNames}
        disabled
        invalid={invalid}
        value="sms"
      >
        Text message
      </RadioControl>
      <RadioControl className={classNames} invalid={invalid} value="post">
        Post
      </RadioControl>
    </FieldLayout>
  );
};

// -----------------------------------------------------------------------------
// Story snapshots
// -----------------------------------------------------------------------------

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Radio group engine without form context', () => {
  it('routes the binding ref to the selected enabled option and releases it on unmount', () => {
    const props = bindings();
    const { unmount } = render(renderField(props));

    act(() => {
      props.inputRef.mock.lastCall?.[0]?.focus();
    });

    expect(screen.getByRole('radio', { name: 'Post' })).toHaveFocus();

    unmount();

    expect(props.inputRef).toHaveBeenLastCalledWith(null);
  });

  it.each(['sms', '', null])(
    'focuses the first enabled option when selection %s cannot receive focus',
    (value) => {
      const props = bindings();
      render(renderField({ ...props, value }));

      act(() => {
        props.inputRef.mock.lastCall?.[0]?.focus();
      });

      expect(screen.getByRole('radio', { name: 'Email' })).toHaveFocus();
    },
  );

  it('keeps group and option descriptions associated as errors become visible', () => {
    const props = bindings();
    const renderGroup = (invalid: boolean) =>
      renderField({
        ...props,
        controlProps: {
          id: ids.control,
          'aria-describedby': invalid
            ? `${ids.description} ${ids.error}`
            : ids.description,
        },
        invalid,
        required: true,
      });
    const { rerender } = render(renderGroup(false));
    const group = screen.getByRole('radiogroup', { name: 'Delivery' });
    const radio = screen.getByRole('radio', { name: 'Email' });

    expect(group).toHaveAccessibleDescription('Choose a method');
    expect(radio).toHaveAccessibleDescription(
      'Choose a method Sent to your inbox',
    );
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(radio).not.toHaveAttribute('required');

    rerender(renderGroup(true));

    expect(screen.getByRole('radiogroup', { name: 'Delivery' })).toBe(group);
    expect(group).toHaveAccessibleDescription('Choose a method Unavailable');
    expect(radio).toHaveAccessibleDescription(
      'Choose a method Unavailable Sent to your inbox',
    );
    expect(radio).toHaveAccessibleName('Email');
    expect(screen.getByText('Delivery').tagName).toBe('SPAN');
    expect(screen.getByText('Delivery')).not.toHaveAttribute('for');
  });

  it('reports string selections and supports keyboard navigation past disabled options', async () => {
    const props = bindings();
    render(renderField({ ...props, value: 'email' }));
    const radio = screen.getByRole('radio', { name: 'Email' });

    act(() => {
      radio.focus();
    });
    await userEvent.keyboard('{ArrowDown}');

    expect(props.onChange).toHaveBeenLastCalledWith('post');
    expect(screen.getByRole('radio', { name: 'Post' })).toHaveFocus();
  });

  it('reports blur when focus leaves the group', async () => {
    const props = bindings();
    render(
      <>
        {renderField(props)}
        <button type="button">Outside</button>
      </>,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(props.onBlur).toHaveBeenCalled();
  });

  it('disables every option and leaves focus alone when no option is enabled', () => {
    const props = bindings();
    render(renderField({ ...props, disabled: true }));

    act(() => {
      props.inputRef.mock.lastCall?.[0]?.focus();
    });

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
    expect(document.body).toHaveFocus();
  });
});
