import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';

import * as edgeCases from './stories/Tabs.edge-cases.stories';
import * as interactions from './stories/Tabs.interactions.stories';
import * as stories from './stories/Tabs.stories';
import Tabs from './Tabs';

const tabs = [
  {
    key: 'one',
    label: 'One',
    content: <input aria-label="Draft" defaultValue="Initial" />,
  },
  { key: 'two', label: 'Two', content: 'Second panel' },
];

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Tabs behavior', () => {
  it('associates the selected tab and panel and normalizes test IDs', () => {
    render(<Tabs ariaLabel="Sections" tabs={tabs} testId="Project tabs" />);
    const tab = screen.getByRole('tab', { name: 'One' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(tab).toHaveAttribute('data-testid', 'project_tabs_one');
  });

  it('preserves controlled selection while reporting requests', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <Tabs
        onSelectionChange={onSelectionChange}
        selectedKey="one"
        tabs={tabs}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('two');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    rerender(<Tabs selectedKey="two" tabs={tabs} />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
  });

  it('unmounts inactive panels by default', () => {
    render(<Tabs tabs={tabs} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('retains inactive panel state when requested', () => {
    render(<Tabs destroyInactiveTabPanel={false} tabs={tabs} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Edited' } });
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(input).toBeInTheDocument();
    expect(input.closest('[data-slot="panel"]')).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('tab', { name: 'One' }));
    expect(screen.getByRole('textbox')).toHaveValue('Edited');
  });

  it('supports numeric keys and both disabled-item APIs', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tabs
        defaultSelectedKey={1}
        disabledKeys={['blocked']}
        onSelectionChange={onSelectionChange}
        tabs={[
          { key: 1, label: 'One', content: 'First' },
          { key: 2, label: 'Two', content: 'Second', disabled: true },
          { key: 'blocked', label: 'Blocked', content: 'Third' },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Blocked' }));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('updates a changed collection and handles an empty one', () => {
    const { rerender } = render(<Tabs tabs={tabs} />);
    rerender(<Tabs tabs={[tabs[1]]} />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
    rerender(<Tabs tabs={[]} />);
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });

  it('keeps the start layout when vertical is combined with an explicit placement', () => {
    const { container } = render(
      <Tabs placement="bottom" tabs={tabs} vertical />,
    );
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
    expect(container.querySelector('[data-slot="tabWrapper"]')).toHaveClass(
      'flex',
    );
    expect(container.querySelector('[data-slot="tabWrapper"]')).not.toHaveClass(
      'flex-col-reverse',
    );
  });

  it('keeps tab selection from submitting a surrounding form', () => {
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Tabs tabs={tabs} />
      </form>,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
