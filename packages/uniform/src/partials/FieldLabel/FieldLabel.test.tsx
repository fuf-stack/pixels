import { describe, expect, it } from 'vitest';

import { Input, Label, TextField } from 'react-aria-components';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import FieldLabel from './FieldLabel';
import * as stories from './stories/FieldLabel.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Shared field label', () => {
  it('associates a native input and keeps the required indicator out of its accessible name', async () => {
    render(
      <>
        <FieldLabel htmlFor="email" id="email-label" required>
          Email
        </FieldLabel>
        <input id="email" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });

    await userEvent.click(screen.getByText('Email'));

    expect(input).toHaveFocus();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Email')).toHaveAttribute('data-slot', 'label');
  });

  it('preserves React Aria label context and focus without a manually assigned control ID', async () => {
    render(
      <TextField>
        <FieldLabel as={Label} required>
          Email
        </FieldLabel>
        <Input />
      </TextField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });

    await userEvent.click(screen.getByText('Email'));

    expect(input).toHaveFocus();
    expect(screen.getByText('Email')).toHaveAttribute('for', input.id);
  });

  it('preserves a group heading and its indicator spacing without creating a nested native label', () => {
    const { rerender } = render(
      <FieldLabel
        aria-level={3}
        as="div"
        id="contacts-label"
        required
        requiredClassName="ms-0.5 text-danger"
        role="heading"
      >
        Contacts
      </FieldLabel>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Contacts' });

    expect(heading.tagName).toBe('DIV');
    expect(heading).toHaveAttribute('id', 'contacts-label');
    expect(screen.getByText('*')).toHaveClass('ms-0.5');
    expect(heading).not.toHaveAttribute('for');

    rerender(<FieldLabel as="span">{null}</FieldLabel>);

    expect(screen.queryByText('Contacts')).not.toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});
