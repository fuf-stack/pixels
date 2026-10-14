import { describe, expect, it } from 'vitest';

import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';

import { render, screen } from '@testing-library/react';

import { createStyling, tv } from '@fuf-stack/pixel-utils';

import { StylingProvider, useStyling } from './StylingProvider';

const recipe = tv({ slots: { input: 'text-sm text-danger' } });
const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

const Control = ({ testId = 'control' }: { testId?: string }) => {
  const helpers = useStyling();
  const classes = helpers.variantsToClassNames(helpers.resolve(recipe), {
    input: 'text-body',
  });
  return (
    <input aria-label={testId} className={classes.input} data-testid={testId} />
  );
};

describe('StylingProvider', () => {
  it('passes merge rules through portals and keeps other roots isolated', () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    const configured = render(
      <StylingProvider styling={styling}>
        <Control />
        {createPortal(<Control testId="portal" />, portal)}
      </StylingProvider>,
    );
    const defaults = render(<Control testId="default" />);
    expect(screen.getByTestId('control').className).toBe(
      'text-danger text-body',
    );
    expect(screen.getByTestId('portal').className).toBe(
      'text-danger text-body',
    );
    expect(screen.getByTestId('default').className).toBe('text-sm text-body');
    configured.unmount();
    defaults.unmount();
    portal.remove();
  });

  it('isolates server renders', () => {
    expect(
      renderToString(
        <StylingProvider styling={styling}>
          <Control />
        </StylingProvider>,
      ),
    ).toContain('class="text-danger text-body"');
    expect(renderToString(<Control />)).toContain('class="text-sm text-body"');
  });
});
