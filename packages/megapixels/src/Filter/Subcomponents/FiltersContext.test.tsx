import type { ReactNode } from 'react';
import type { FiltersConfiguration } from '../filters/types';

import { describe, expect, it } from 'vitest';

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Form from '@fuf-stack/uniform/Form';

import { filters as f } from '..';
import { FiltersContextProvider, useFilters } from './FiltersContext';

const config: FiltersConfiguration = [
  f.boolean({ name: 'status' }),
  f.checkboxes({
    name: 'owners',
    config: {
      text: 'Owners',
      options: [
        { label: 'Alice', value: 'a' },
        { label: 'Xavier', value: 'x' },
        { label: 'Bob', value: 'b' },
      ],
    },
  }),
];

const Consumer = () => {
  const ctx = useFilters();
  return (
    <div>
      <div data-testid="active">{ctx.activeFilters.join(',')}</div>
      <div data-testid="unused">{ctx.unusedFilters.join(',')}</div>
    </div>
  );
};

const Wrapper = ({
  children,
  initial = {},
}: {
  children: ReactNode;
  initial?: Record<string, unknown>;
}) => (
  <Form initialValues={{ filter: initial }} name="f" onSubmit={() => {}}>
    <FiltersContextProvider config={config}>{children}</FiltersContextProvider>
  </Form>
);

describe('FiltersContext', () => {
  it('derives active/unused filters from form state', async () => {
    await act(async () => {
      render(
        <Wrapper initial={{ status: true }}>
          <Consumer />
        </Wrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('active').textContent).toBe('status');
      expect(screen.getByTestId('unused').textContent).toBe('owners');
    });
  });

  it('addFilter seeds default value and can be removed via removeFilter', async () => {
    const Test = () => {
      const ctx = useFilters();
      return (
        <>
          <button onClick={() => ctx.addFilter('status')} type="button">
            add
          </button>
          <button onClick={() => ctx.removeFilter('status')} type="button">
            remove
          </button>
        </>
      );
    };

    await act(async () => {
      render(
        <Wrapper>
          <Test />
          <Consumer />
        </Wrapper>,
      );
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('add'));
    await user.click(screen.getByText('remove'));

    await waitFor(() => {
      expect(screen.getByTestId('active').textContent).toBe('');
      expect(screen.getByTestId('unused').textContent).toBe('status,owners');
    });
  });
});
