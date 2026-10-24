import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';

import SearchInput from './SearchInput';
import * as edgeCases from './stories/SearchInput.edge-cases.stories';
import * as interactions from './stories/SearchInput.interactions.stories';
import * as stories from './stories/SearchInput.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('SearchInput behavior', () => {
  it('names an input without a placeholder and normalizes its test ID', () => {
    render(<SearchInput onChange={vi.fn()} testId="Search Projects" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute(
      'data-testid',
      'search_projects',
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'off');
  });

  it('reads its initial value once and reports ordinary edits including empty text', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SearchInput
        initialValue="Initial"
        onChange={onChange}
        placeholder="Find projects"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Find projects' });
    expect(input).toHaveValue('Initial');

    fireEvent.change(input, { target: { value: 'Edited' } });
    expect(onChange).toHaveBeenLastCalledWith('Edited');
    rerender(
      <SearchInput
        initialValue="Changed default"
        onChange={onChange}
        placeholder="Find projects"
      />,
    );
    expect(input).toHaveValue('Edited');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('clears with a null callback, restores focus and never submits its form', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <SearchInput initialValue="Projects" onChange={onChange} />
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'clear input' }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears with Escape without swallowing the keyboard event', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SearchInput initialValue="Projects" onChange={onChange} />,
    );
    const onKeyDown = vi.fn();
    container.addEventListener('keydown', onKeyDown);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('disables editing and clearing while retaining the stored value', () => {
    const onChange = vi.fn();
    render(<SearchInput disabled initialValue="Stored" onChange={onChange} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveValue('Stored');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('styles public slots and retains custom leading content', () => {
    render(
      <SearchInput
        className={{ input: 'text-lg', inputWrapper: 'bg-danger' }}
        onChange={vi.fn()}
        startContent={<span>Find</span>}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveClass('text-lg');
    expect(screen.getByRole('textbox')).not.toHaveClass('text-small');
    expect(screen.getByText('Find').parentElement?.parentElement).toHaveClass(
      'bg-danger',
    );
  });
});
