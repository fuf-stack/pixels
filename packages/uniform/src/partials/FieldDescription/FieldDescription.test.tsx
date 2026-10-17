import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import FieldDescription from './FieldDescription';
import * as stories from './stories/FieldDescription.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Help text visibility', () => {
  it('removes empty help text and restores its control association when content arrives', () => {
    const renderField = (description: string | null) => (
      <>
        <input aria-describedby="email-description" aria-label="Email" />
        <FieldDescription id="email-description">
          {description}
        </FieldDescription>
      </>
    );
    const { container, rerender } = render(renderField(null));

    expect(container.querySelector('#email-description')).toBeNull();

    rerender(renderField('Use your work email'));

    expect(
      screen.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Use your work email');

    rerender(renderField(''));

    expect(container.querySelector('#email-description')).toBeNull();
    expect(screen.getByRole('textbox')).not.toHaveAccessibleDescription();
  });
});
