import type { FieldError } from 'react-hook-form';

import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';

import FieldValidationError from './FieldValidationError';
import * as stories from './stories/FieldValidationError.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Validation presentation', () => {
  const errors: FieldError[] = [
    { type: 'required', message: 'Email is required' },
  ];

  it('preserves the standalone list and string class name target', () => {
    const { container } = render(
      <FieldValidationError
        className="font-semibold"
        error={errors}
        testId="email"
      />,
    );
    const list = screen.getByRole('list', {
      name: 'Validation errors of field email',
    });

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(list);
    expect(list).toHaveClass('font-semibold');
    expect(list).toHaveAttribute('data-testid', 'email_error');
    expect(container.querySelector('[data-slot="error-message"]')).toBeNull();
  });

  it('owns the error association and slot styles without imposing a live region', () => {
    const { container } = render(
      <>
        <input aria-describedby="email-error" aria-label="Email" />
        <FieldValidationError
          className={{
            base: 'list-disc',
            item: 'font-medium',
            message: 'px-0',
            wrapper: 'text-danger',
          }}
          error={errors}
          id="email-error"
          testId="email"
        />
      </>,
    );
    const wrapper = container.querySelector('#email-error');
    const list = screen.getByRole('list');

    expect(
      screen.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Email is required');
    expect(wrapper).toHaveAttribute('data-slot', 'error-message');
    expect(wrapper).toHaveClass('text-danger');
    expect(list.parentElement).toBe(wrapper);
    expect(list).toHaveClass('list-disc');
    expect(screen.getByRole('listitem')).toHaveClass('font-medium');
    expect(screen.getByText('Email is required')).toHaveClass('px-0');
    expect(wrapper).not.toHaveAttribute('role');
    expect(wrapper).not.toHaveAttribute('aria-live');
    expect(list).not.toHaveAttribute('aria-live');
  });

  it('keeps the association target when messages are cleared', async () => {
    const { container, rerender } = render(
      <FieldValidationError error={errors} id="email-error" testId="email" />,
    );
    const wrapper = container.querySelector('#email-error');
    const list = screen.getByRole('list');

    rerender(<FieldValidationError id="email-error" testId="email" />);

    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    expect(container.querySelector('#email-error')).toBe(wrapper);
    expect(screen.getByRole('list')).toBe(list);
    expect(list).toBeEmptyDOMElement();
  });

  it('updates the rendered message list when error data changes', async () => {
    const { rerender } = render(
      <FieldValidationError error={errors} id="email-error" testId="email" />,
    );

    rerender(
      <FieldValidationError
        error={[
          { type: 'custom', message: 'Use your work email' },
          { type: 'custom', message: 'Address is already used' },
        ]}
        id="email-error"
        testId="email"
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Use your work email')).toBeInTheDocument();
    expect(screen.getByText('Address is already used')).toBeInTheDocument();
  });
});
