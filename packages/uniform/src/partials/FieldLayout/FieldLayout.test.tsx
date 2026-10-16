import { describe, expect, it } from 'vitest';

import { createRef } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import FieldValidationError from '../FieldValidationError';
import FieldLayout from './FieldLayout';
import * as stories from './FieldLayout.stories';

const ids = {
  control: 'email',
  label: 'email-label',
  description: 'email-description',
  error: 'email-error',
};

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Shared field arrangement', () => {
  it('renders the label, control and hints directly inside the owning root', () => {
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <section aria-label="Field root">
        <FieldLayout
          className={{}}
          description="Use your work email"
          errorMessage={
            <FieldValidationError
              error={[
                { type: 'custom', message: 'Enter a valid email address' },
              ]}
              testId="email"
            />
          }
          ids={ids}
          invalid
          label="Email"
          required
        >
          <input
            ref={inputRef}
            aria-describedby={`${ids.description} ${ids.error}`}
            id={ids.control}
          />
        </FieldLayout>
      </section>,
    );
    const root = screen.getByRole('region', { name: 'Field root' });
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(container.children).toHaveLength(1);
    expect(root.children).toHaveLength(3);
    expect(root.children[0]).toBe(screen.getByText('Email'));
    expect(root.children[1]).toBe(input);
    expect(root.children[2]).toBe(
      screen.getByText('Use your work email').parentElement,
    );
    expect(inputRef.current).toBe(input);
    expect(input).toHaveAccessibleDescription(
      'Use your work email Enter a valid email address',
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('id');
  });

  it('updates validation without replacing the editable control', () => {
    const renderLayout = (invalid: boolean) => (
      <FieldLayout
        className={{}}
        description="Use your work email"
        errorMessage={
          <FieldValidationError
            error={[{ type: 'custom', message: 'Enter a valid email address' }]}
            testId="email"
          />
        }
        ids={ids}
        invalid={invalid}
        label="Email"
      >
        <input
          aria-describedby={
            invalid ? `${ids.description} ${ids.error}` : ids.description
          }
          id={ids.control}
        />
      </FieldLayout>
    );
    const { rerender } = render(renderLayout(false));
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toHaveAccessibleDescription('Use your work email');
    expect(
      screen.queryByText('Enter a valid email address'),
    ).not.toBeInTheDocument();

    rerender(renderLayout(true));

    expect(screen.getByRole('textbox', { name: 'Email' })).toBe(input);
    expect(input).toHaveAccessibleDescription(
      'Use your work email Enter a valid email address',
    );

    rerender(renderLayout(false));

    expect(screen.getByRole('textbox', { name: 'Email' })).toBe(input);
    expect(input).toHaveAccessibleDescription('Use your work email');
    expect(
      screen.queryByText('Enter a valid email address'),
    ).not.toBeInTheDocument();
  });

  it('renders only the supplied control when there is no label or hint content', () => {
    const { container } = render(
      <FieldLayout className={{}} errorMessage={null} ids={ids} invalid={false}>
        <input aria-label="Email" id={ids.control} />
      </FieldLayout>,
    );

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(
      screen.getByRole('textbox', { name: 'Email' }),
    );
  });

  it('adds an error-only wrapper when validation becomes visible', () => {
    const renderLayout = (invalid: boolean) => (
      <FieldLayout
        className={{}}
        errorMessage={
          <FieldValidationError
            error={[{ type: 'custom', message: 'Required' }]}
            testId="email"
          />
        }
        ids={ids}
        invalid={invalid}
      >
        <input
          aria-describedby={invalid ? ids.error : undefined}
          aria-label="Email"
          id={ids.control}
        />
      </FieldLayout>
    );
    const { container, rerender } = render(renderLayout(false));
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();

    rerender(renderLayout(true));

    expect(screen.getByRole('textbox', { name: 'Email' })).toBe(input);
    expect(input).toHaveAccessibleDescription('Required');
    expect(
      screen.getByText('Required').closest('[data-slot="error-message"]'),
    ).toHaveAttribute('id', ids.error);
    expect(container.querySelector('[data-slot="description"]')).toBeNull();

    rerender(renderLayout(false));

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();
    expect(input).not.toHaveAccessibleDescription();
  });

  it('associates supplied error content without requiring validation data', () => {
    render(
      <FieldLayout
        className={{ errorMessage: 'custom-error' }}
        errorMessage={<strong>Choose another address</strong>}
        ids={ids}
        invalid
      >
        <input
          aria-describedby={ids.error}
          aria-label="Email"
          id={ids.control}
        />
      </FieldLayout>,
    );

    expect(
      screen.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Choose another address');
    const wrapper = screen.getByText('Choose another address').parentElement;
    expect(wrapper).toHaveAttribute('id', ids.error);
    expect(wrapper).toHaveAttribute('data-slot', 'error-message');
    expect(wrapper).toHaveClass('custom-error');
  });

  it('omits empty description elements and adds them when help text arrives', () => {
    const renderLayout = (description: string | null) => (
      <FieldLayout
        className={{}}
        description={description}
        errorMessage={null}
        ids={ids}
        invalid={false}
      >
        <input
          aria-describedby={description ? ids.description : undefined}
          aria-label="Email"
          id={ids.control}
        />
      </FieldLayout>
    );
    const { container, rerender } = render(renderLayout(null));
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();

    rerender(renderLayout('Use your work email'));

    expect(input).toHaveAccessibleDescription('Use your work email');
    expect(screen.getByText('Use your work email')).toHaveAttribute(
      'id',
      ids.description,
    );

    rerender(renderLayout(''));

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();
    expect(input).not.toHaveAccessibleDescription();
  });
});
