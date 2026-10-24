import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import { createStyling } from '@fuf-stack/pixel-utils';

import { StylingProvider } from '../StylingProvider';
import ProgressCircular from './ProgressCircular';
import * as edgeCaseStories from './stories/ProgressCircular.edge-cases.stories';
import * as interactionStories from './stories/ProgressCircular.interactions.stories';
import * as stories from './stories/ProgressCircular.stories';

describe('<ProgressCircular /> spec', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<ProgressCircular percent={42} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('property className', () => {
    render(<ProgressCircular className="test1 test2 test3" percent={42} />);
    expect(document.querySelector('.test1')).toBeInTheDocument();
    expect(document.querySelector('.test2')).toBeInTheDocument();
    expect(document.querySelector('.test3')).toBeInTheDocument();
  });
});

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
  storySnapshots(edgeCaseStories);
});

describe('ProgressCircular behavior', () => {
  test('keeps accessible progress separate from rich value content', () => {
    render(
      <ProgressCircular
        ariaLabel="Upload"
        format={(percent) => <strong>{percent} files</strong>}
        percent={42}
      />,
    );
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '42');
    expect(progress).toHaveAttribute('aria-valuetext', '42%');
    expect(screen.getByText('42 files').tagName).toBe('STRONG');
    expect(progress.querySelector('[data-slot="svg"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test.each([
    [-10, 0],
    [0, 0],
    [42, 42],
    [150, 100],
  ])(
    'clamps %s to %s for the ring and accessible value',
    (percent, expected) => {
      render(<ProgressCircular percent={percent} />);
      const progress = screen.getByRole('progressbar');
      const indicator = progress.querySelector('[data-slot="indicator"]');
      const circumference = 2 * 14.4 * Math.PI;
      expect(progress).toHaveAttribute('aria-valuenow', String(expected));
      expect(Number(indicator?.getAttribute('stroke-dashoffset'))).toBeCloseTo(
        circumference * (1 - expected / 100),
      );
    },
  );

  test.each([
    ['xs', 2],
    ['sm', 1.8],
    ['md', 1.6],
    ['lg', 1.6],
    ['xl', 1.6],
  ] as const)('uses the stroke width for size %s', (size, width) => {
    render(<ProgressCircular percent={42} size={size} />);
    expect(
      screen.getByRole('progressbar').querySelector('[data-slot="svg"]'),
    ).toHaveAttribute('stroke-width', String(width));
  });

  test('uses custom stroke widths for both circles', () => {
    render(<ProgressCircular percent={42} strokeWidth={4} />);
    const progress = screen.getByRole('progressbar');
    expect(progress.querySelector('[data-slot="svg"]')).toHaveAttribute(
      'stroke-width',
      '4',
    );
    expect(progress.querySelector('[data-slot="track"]')).toHaveAttribute(
      'r',
      '12',
    );
    expect(progress.querySelector('[data-slot="indicator"]')).toHaveAttribute(
      'r',
      '12',
    );
  });

  test('gives errors precedence over completion and allows disabling completion feedback', () => {
    const { rerender } = render(<ProgressCircular percent={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress.querySelector('[data-slot="svg"]')).toHaveClass(
      'text-success',
    );
    expect(progress.querySelector('[data-slot="value"] svg')).toHaveClass(
      'text-success',
    );
    expect(progress).not.toHaveAttribute('aria-valuetext', '[object Object]');

    rerender(<ProgressCircular hasError percent={100} />);
    expect(progress.querySelector('[data-slot="svg"]')).toHaveClass(
      'text-danger',
    );
    expect(progress.querySelector('[data-slot="value"] svg')).toHaveClass(
      'text-danger',
    );
    expect(progress).toHaveAttribute('aria-valuetext', 'Error');

    rerender(<ProgressCircular disableFinishedState percent={100} />);
    expect(progress.querySelector('[data-slot="svg"]')).toHaveClass(
      'text-info',
    );
    expect(screen.getByText('100%')).toBeVisible();
  });

  test('updates the ring without an initial or disabled animation', () => {
    const { rerender } = render(<ProgressCircular percent={25} />);
    const indicator = screen
      .getByRole('progressbar')
      .querySelector('[data-slot="indicator"]');
    expect(indicator).toHaveClass('!transition-none');
    rerender(<ProgressCircular percent={50} />);
    expect(indicator).not.toHaveClass('!transition-none');
    rerender(<ProgressCircular disableAnimation percent={75} />);
    expect(indicator).toHaveClass('!transition-none');
  });

  test('resolves custom value styles with the consumer styling instance', () => {
    const styling = createStyling({
      extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
    });
    render(
      <StylingProvider styling={styling}>
        <ProgressCircular
          className={{ value: 'text-body text-danger' }}
          percent={42}
          size="sm"
        />
      </StylingProvider>,
    );
    expect(screen.getByText('42%')).toHaveClass('text-body', 'text-danger');
    expect(screen.getByText('42%')).not.toHaveClass('text-xs');
  });
});
