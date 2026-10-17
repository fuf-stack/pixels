import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import { createStyling } from '@fuf-stack/pixel-utils';

import { StylingProvider } from '../StylingProvider';
import Progress from './Progress';
import * as edgeCaseStories from './stories/Progress.edge-cases.stories';
import * as interactionStories from './stories/Progress.interactions.stories';
import * as stories from './stories/Progress.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
  storySnapshots(edgeCaseStories);
});

describe('Progress behavior', () => {
  it('exposes the range, value and visible label', () => {
    render(
      <Progress
        label="Uploading"
        percent={42}
        showValueLabel
        testId="upload"
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '42');
    expect(progress).toHaveAttribute('aria-valuetext', '42%');
    expect(progress).toHaveAccessibleName('progress Uploading');
    expect(screen.getByTestId('upload')).toBe(progress);
    expect(progress.querySelector('[data-slot="indicator"]')).toHaveStyle({
      transform: 'translateX(-58%)',
    });
  });

  it.each([
    [-10, 0],
    [0, 0],
    [150, 100],
  ])(
    'clamps %s to %s without changing the formatted value',
    (percent, expected) => {
      render(<Progress percent={percent} showValueLabel />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', String(expected));
      expect(progress.querySelector('[data-slot="indicator"]')).toHaveStyle({
        transform: `translateX(-${100 - expected}%)`,
      });
      expect(screen.getByText(`${percent}%`)).toBeInTheDocument();
    },
  );

  it('updates progress and applies the finished color only when enabled', () => {
    const { rerender } = render(<Progress percent={40} />);
    const indicator = screen
      .getByRole('progressbar')
      .querySelector('[data-slot="indicator"]');
    expect(indicator).toHaveClass('bg-info');
    rerender(<Progress percent={100} />);
    expect(indicator).toHaveClass('bg-success');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    rerender(<Progress disableFinishedState percent={100} />);
    expect(indicator).toHaveClass('bg-info');
  });

  it('does not announce a percentage for indeterminate work', () => {
    render(
      <Progress disableAnimation indeterminate percent={42} showValueLabel />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).not.toHaveAttribute('aria-valuetext');
    expect(progress.querySelector('[data-slot="value"]')).toBeEmptyDOMElement();
    expect(progress.querySelector('[data-slot="indicator"]')).toHaveStyle({
      transform: 'translateX(25%) scaleX(0.5)',
    });
  });

  it('keeps rich formatting out of ARIA attributes', () => {
    render(
      <Progress
        format={(percent) => <strong>{percent} files</strong>}
        percent={42}
        showValueLabel
      />,
    );
    expect(screen.getByText('42 files').tagName).toBe('STRONG');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '42%',
    );
  });

  it('announces text from a custom formatter', () => {
    render(<Progress format={(percent) => `${percent} files`} percent={42} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '42 files',
    );
  });

  it('resolves consumer slot styles through the styling provider', () => {
    const styling = createStyling({
      extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
    });
    render(
      <StylingProvider styling={styling}>
        <Progress
          className={{ label: 'text-body text-danger', track: 'h-6' }}
          label="Upload"
          percent={42}
        />
      </StylingProvider>,
    );
    expect(screen.getByText('Upload')).toHaveClass('text-body', 'text-danger');
    expect(screen.getByText('Upload')).not.toHaveClass('text-medium');
    expect(
      screen.getByRole('progressbar').querySelector('[data-slot="track"]'),
    ).toHaveClass('h-6');
  });
});
