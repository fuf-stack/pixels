import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import FieldHelper from './FieldHelper';
import * as stories from './stories/FieldHelper.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Helper visibility', () => {
  const ids = { description: 'email-description', error: 'email-error' };

  const renderField = (props: {
    description?: string;
    errorMessage?: string;
    invalid: boolean;
  }) => (
    <>
      <input
        aria-describedby={`${ids.description} ${ids.error}`}
        aria-label="Email"
      />
      <FieldHelper ids={ids} {...props} />
    </>
  );

  it('renders no wrapper without help text or visible validation', () => {
    const { container, rerender } = render(
      renderField({ errorMessage: 'Invalid email address', invalid: false }),
    );

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();
    expect(screen.queryByText('Invalid email address')).toBeNull();

    rerender(renderField({ description: '', invalid: false }));

    expect(container.querySelector('[data-slot="helper-wrapper"]')).toBeNull();
  });

  it('describes the control with help text and validation messages', () => {
    const { container, rerender } = render(
      renderField({ description: 'Use your work email', invalid: false }),
    );
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toHaveAccessibleDescription('Use your work email');
    expect(container.querySelector('#email-error')).toBeNull();

    rerender(
      renderField({
        description: 'Use your work email',
        errorMessage: 'Invalid email address',
        invalid: true,
      }),
    );

    expect(input).toHaveAccessibleDescription(
      'Use your work email Invalid email address',
    );
    expect(screen.getByText('Invalid email address')).toHaveAttribute(
      'data-slot',
      'error-message',
    );
  });

  it('keeps the error slot while validation is visible without help text', () => {
    const { container } = render(renderField({ invalid: true }));

    expect(
      container.querySelector('[data-slot="helper-wrapper"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('#email-error')).toHaveAttribute(
      'data-slot',
      'error-message',
    );
    expect(container.querySelector('#email-description')).toBeNull();
  });
});
