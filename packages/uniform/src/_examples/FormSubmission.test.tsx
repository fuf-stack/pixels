import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import Form from '../Form';
import SubmitButton from '../SubmitButton';
import * as stories from './FormSubmission.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('submit behavior', () => {
  it('should call onSubmit exactly once when clicking the SubmitButton', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <Form onSubmit={onSubmit}>
        <SubmitButton />
      </Form>,
    );

    await user.click(screen.getByRole('button'));

    // SubmitButton is a plain native type="submit" button (no onClick handler),
    // so a click submits the surrounding form natively exactly once.
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('associates the SubmitButton with a form rendered elsewhere via remoteFormId', () => {
    render(
      <>
        <Form onSubmit={vi.fn()} remoteFormId="my-form">
          <div />
        </Form>
        {/* outside the form, associated via the native HTML form attribute */}
        <SubmitButton remoteFormId="my-form" />
      </>,
    );

    // the button is wired up as a submit control of the remote form. The actual
    // native submission on click/Enter is a trusted-event browser behavior and
    // cannot be exercised with user-event here (see SUBMITBUTTON_CONTEXT.md).
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'my-form');
    expect(document.getElementById('my-form')?.tagName).toBe('FORM');
  });
});
