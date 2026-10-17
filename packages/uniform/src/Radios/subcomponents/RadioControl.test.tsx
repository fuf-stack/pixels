import { describe, expect, it } from 'vitest';

import { RadioGroup } from 'react-aria-components';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { variantsToClassNames } from '@fuf-stack/pixel-utils';

import RadioControl from './RadioControl';
import radioControlVariants from './radioControlVariants';
import * as stories from './stories/RadioControl.stories';

const variants = radioControlVariants();
const classNames = variantsToClassNames(variants);

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Radio option presentation', () => {
  it('associates its own label and description without adding the icon to the accessible name', async () => {
    render(
      <RadioGroup aria-label="Delivery">
        <RadioControl
          className={classNames}
          description="Sent to your inbox"
          icon={<span aria-hidden>✉</span>}
          invalid={false}
          value="email"
        >
          Email
        </RadioControl>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Email' });

    expect(radio).toHaveAccessibleDescription('Sent to your inbox');
    await userEvent.click(screen.getByText('Sent to your inbox'));
    expect(radio).toBeChecked();
  });

  it('uses the Aria hover state for the unselected indicator and keeps disabled options inert', async () => {
    render(
      <RadioGroup aria-label="Delivery">
        <RadioControl className={classNames} invalid={false} value="email">
          Email
        </RadioControl>
        <RadioControl
          className={classNames}
          disabled
          invalid={false}
          value="post"
        >
          Post
        </RadioControl>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Email' });
    const label = screen.getByText('Email').closest('label') as HTMLElement;

    await userEvent.hover(label);
    expect(label).toHaveAttribute('data-hover-unselected', 'true');
    await userEvent.click(radio);
    expect(label).not.toHaveAttribute('data-hover-unselected');
    await userEvent.click(screen.getByRole('radio', { name: 'Post' }));
    expect(radio).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Post' })).toBeDisabled();
  });
});
