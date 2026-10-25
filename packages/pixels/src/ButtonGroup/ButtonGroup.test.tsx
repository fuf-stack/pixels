import '@testing-library/jest-dom/vitest';

import { describe, expect, it } from 'vitest';

import { createRef } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import { Button } from '../Button';
import ButtonGroup from './ButtonGroup';
import * as stories from './stories/ButtonGroup.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('ButtonGroup behavior', () => {
  it('forwards native group attributes and its ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref} aria-label="Actions" id="actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );

    expect(ref.current).toBe(screen.getByRole('group', { name: 'Actions' }));
    expect(ref.current).toHaveAttribute('id', 'actions');
  });

  it('preserves Pixels child defaults over group defaults', () => {
    render(
      <ButtonGroup color="danger" isDisabled size="lg" variant="bordered">
        <Button>Save</Button>
        <Button disabled>Delete</Button>
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'h-10',
      'bg-default',
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('updates shared width and isolates nested groups', () => {
    const { rerender } = render(
      <ButtonGroup fullWidth>
        <Button>Outer</Button>
        <ButtonGroup>
          <Button>Inner</Button>
        </ButtonGroup>
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', { name: 'Outer' })).toHaveClass('w-full');
    expect(screen.getByRole('button', { name: 'Inner' })).not.toHaveClass(
      'w-full',
    );

    rerender(
      <ButtonGroup>
        <Button>Outer</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Outer' })).not.toHaveClass(
      'w-full',
    );
  });
});
