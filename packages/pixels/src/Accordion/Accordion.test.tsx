import { describe, expect, test, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen, within } from '@testing-library/react';

import Accordion from './Accordion';
import * as edgeCases from './stories/Accordion.edge-cases.stories';
import * as interactions from './stories/Accordion.interactions.stories';
import * as stories from './stories/Accordion.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Coverage', () => {
  test('should render with undefined className', () => {
    const { container } = render(
      <Accordion accordionItems={[]} className={undefined} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Selection and keyboard behavior', () => {
  const accordionItems = [
    { title: 'First', children: 'First panel' },
    { title: 'Second', children: 'Second panel' },
    { title: 'Third', children: <button type="button">Panel action</button> },
  ];

  test('expands multiple panels with distinct heading associations', () => {
    render(<Accordion accordionItems={accordionItems} />);
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'First' })).toHaveAttribute(
      'id',
      first.getAttribute('aria-controls'),
    );
    expect(screen.getByRole('region', { name: 'Second' })).toHaveAttribute(
      'id',
      second.getAttribute('aria-controls'),
    );
    expect(first.getAttribute('aria-controls')).not.toBe(
      second.getAttribute('aria-controls'),
    );
  });

  test('supports single selection and preserves the final required panel', () => {
    render(
      <Accordion
        accordionItems={accordionItems}
        defaultSelectedKeys={['0']}
        disallowEmptySelection
        selectionMode="single"
      />,
    );
    const first = screen.getByRole('button', { name: 'First' });
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Second' }));
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('reports controlled changes without changing the supplied selection', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <Accordion
        accordionItems={accordionItems}
        onSelectionChange={onSelectionChange}
        selectedKeys={['0']}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Second' }));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['0', '1']));
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    rerender(
      <Accordion accordionItems={accordionItems} selectedKeys={['1']} />,
    );
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('accepts numeric keys and controlled all selection', () => {
    const { rerender } = render(
      <Accordion
        accordionItems={accordionItems}
        defaultSelectedKeys={[1]}
        disabledKeys={[0]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'First' })).toBeDisabled();

    rerender(<Accordion accordionItems={accordionItems} selectedKeys="all" />);
    expect(screen.getAllByRole('region')).toHaveLength(3);
  });

  test('moves between enabled headings without handling keys inside panels', () => {
    render(
      <Accordion
        accordionItems={accordionItems}
        defaultSelectedKeys={['2']}
        disabledKeys={['1']}
      />,
    );
    const first = screen.getByRole('button', { name: 'First' });
    const third = screen.getByRole('button', { name: 'Third' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(third).toHaveFocus();
    fireEvent.keyDown(third, { key: 'Home' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(third).toHaveFocus();

    const action = screen.getByRole('button', { name: 'Panel action' });
    action.focus();
    fireEvent.keyDown(action, { key: 'ArrowUp' });
    expect(action).toHaveFocus();
  });

  test('respects item and group disabling and optional indicators', () => {
    const { container, rerender } = render(
      <Accordion
        accordionItems={[{ ...accordionItems[0], disabled: true }]}
        hideIndicator
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(
      container.querySelector('[data-slot="indicator"]'),
    ).not.toBeInTheDocument();

    rerender(<Accordion accordionItems={accordionItems} disabled />);
    expect(
      screen
        .getAllByRole('button')
        .every((button) => button.hasAttribute('disabled')),
    ).toBe(true);
  });

  test('does not route a nested accordion’s heading keys through its parent', () => {
    render(
      <Accordion
        accordionItems={[
          {
            title: 'Outer',
            children: <Accordion accordionItems={accordionItems} />,
          },
        ]}
        defaultSelectedKeys="all"
      />,
    );
    const inner = screen.getByRole('button', { name: 'First' });
    inner.focus();
    fireEvent.keyDown(inner, { key: 'End' });
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
    expect(
      within(screen.getByRole('region', { name: 'Outer' })).getByRole(
        'button',
        { name: 'Third' },
      ),
    ).toHaveFocus();
  });
});
