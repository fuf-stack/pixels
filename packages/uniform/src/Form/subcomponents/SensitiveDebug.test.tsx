import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { array, jsonObject, string, veto } from '@fuf-stack/veto';

import Input from '../../Input';
import Form from '../Form';
import FormDebugViewer from './FormDebugViewer';
import { redactDebugData } from './SensitiveFields';

const { debugLog, jsonRenders } = vi.hoisted(() => ({
  debugLog: vi.fn(),
  jsonRenders: vi.fn(),
}));
vi.mock('debug', () => ({ default: () => debugLog }));
vi.mock('@fuf-stack/pixels/Json', () => ({
  Json: ({ value }: { value: unknown }) => {
    jsonRenders(value);
    return <pre data-testid="debug-json">{JSON.stringify(value)}</pre>;
  },
}));

const debugPayload = () =>
  JSON.parse(screen.getByTestId('debug-json').textContent ?? '{}') as {
    values: Record<string, unknown>;
    errors: Record<string, unknown> | null;
  };

describe('Sensitive debug data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    window.localStorage.clear();
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    window.localStorage.setItem('uniform:debug-mode', JSON.stringify('debug'));
  });

  it('redacts passwords from the first debug render and logs, preserving submission', async () => {
    const onSubmit = vi.fn();
    const initial = { username: 'john', password: 'Initial_123' };
    render(
      <Form initialValues={initial} onSubmit={onSubmit}>
        <Input name="username" />
        <Input debounceDelay={0} name="password" type="password" />
        <FormDebugViewer />
        <button type="submit">Submit</button>
      </Form>,
    );
    expect(debugPayload().values).toEqual({
      username: 'john',
      password: '[REDACTED]',
    });
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain('Initial_123');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'text');
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Updated_456' },
    });
    await waitFor(() =>
      expect(debugPayload().values.password).toBe('[REDACTED]'),
    );
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      username: 'john',
      password: 'Updated_456',
    });
    expect(debugLog).toHaveBeenCalledWith('onSubmit callback called', {
      submitData: { username: 'john', password: '[REDACTED]' },
    });
    expect(JSON.stringify(debugLog.mock.calls)).not.toContain('Updated_456');
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain('Updated_456');
  });

  it('redacts explicit sensitive fields and nested array passwords', () => {
    render(
      <Form
        initialValues={{
          apiToken: 'token-secret',
          accounts: [{ password: 'nested-secret', username: 'john' }],
        }}
        onSubmit={vi.fn()}
      >
        <Input name="apiToken" sensitive />
        <Input name="accounts.0.password" type="password" />
        <Input name="accounts.0.username" />
        <FormDebugViewer />
      </Form>,
    );
    expect(debugPayload().values).toEqual({
      apiToken: '[REDACTED]',
      accounts: [{ password: '[REDACTED]', username: 'john' }],
    });
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
      'token-secret',
    );
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
      'nested-secret',
    );
    expect(screen.getByTestId('apitoken')).not.toHaveAttribute('sensitive');
  });

  it.each([false, true])(
    'redacts original paths before compacting submitted arrays (validation: %s)',
    async (withValidation) => {
      const onSubmit = vi.fn();
      const initialValues = {
        accounts: [
          {},
          {
            password: 'shifted-password-secret',
            username: 'john',
            tokens: [{}, { value: 'shifted-token-secret' }],
          },
        ],
      };
      render(
        <Form
          initialValues={initialValues}
          onSubmit={onSubmit}
          validation={
            withValidation ? veto({ accounts: array(jsonObject()) }) : undefined
          }
        >
          <Input name="accounts.1.password" type="password" />
          <Input name="accounts.1.tokens.1.value" sensitive />
          <FormDebugViewer />
          <button type="submit">Submit</button>
        </Form>,
      );

      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
      expect(onSubmit.mock.calls[0][0]).toEqual({
        accounts: [
          {
            password: 'shifted-password-secret',
            username: 'john',
            tokens: [{ value: 'shifted-token-secret' }],
          },
        ],
      });
      expect(debugLog).toHaveBeenCalledWith('onSubmit callback called', {
        submitData: {
          accounts: [
            {
              password: '[REDACTED]',
              username: 'john',
              tokens: [{ value: '[REDACTED]' }],
            },
          ],
        },
      });
      expect(JSON.stringify(debugLog.mock.calls)).not.toContain(
        'shifted-password-secret',
      );
      expect(JSON.stringify(debugLog.mock.calls)).not.toContain(
        'shifted-token-secret',
      );
      expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
        'shifted-password-secret',
      );
      expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
        'shifted-token-secret',
      );
      expect(initialValues.accounts).toHaveLength(2);
      expect(initialValues.accounts[1]?.tokens).toHaveLength(2);
    },
  );

  it('retains redaction after a sensitive input is unmounted', () => {
    const Fields = () => {
      const [visible, setVisible] = useState(true);
      return (
        <>
          {visible ? <Input name="password" type="password" /> : null}
          <button onClick={() => setVisible(false)} type="button">
            Hide field
          </button>
        </>
      );
    };
    render(
      <Form initialValues={{ password: 'retained-secret' }} onSubmit={vi.fn()}>
        <Fields />
        <FormDebugViewer />
      </Form>,
    );
    fireEvent.click(screen.getByText('Hide field'));
    expect(screen.queryByTestId('password')).not.toBeInTheDocument();
    expect(debugPayload().values.password).toBe('[REDACTED]');
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
      'retained-secret',
    );
  });

  it('keeps password redaction when sensitive is false and reveal is disabled', () => {
    render(
      <Form initialValues={{ password: 'still-secret' }} onSubmit={vi.fn()}>
        <Input
          hidePasswordToggle
          name="password"
          sensitive={false}
          type="password"
        />
        <FormDebugViewer />
      </Form>,
    );
    expect(debugPayload().values.password).toBe('[REDACTED]');
  });

  it('redacts validation error payloads and logs without changing validation', async () => {
    const onSubmit = vi.fn();
    render(
      <Form
        initialValues={{ password: 'invalid-secret' }}
        onSubmit={onSubmit}
        validation={veto({
          password: string().refine(() => false, {
            message: 'Invalid password: invalid-secret',
          }),
        })}
      >
        <Input name="password" type="password" />
        <FormDebugViewer />
        <button type="submit">Submit</button>
      </Form>,
    );
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() =>
      expect(debugPayload().errors?.password).toBe('[REDACTED]'),
    );
    fireEvent.click(screen.getByText('Submit'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(JSON.stringify(jsonRenders.mock.calls)).not.toContain(
      'invalid-secret',
    );
    expect(JSON.stringify(debugLog.mock.calls)).not.toContain('invalid-secret');
  });

  it('does not carry sensitive paths into a different form instance', () => {
    const first = render(
      <Form initialValues={{ value: 'secret' }} onSubmit={vi.fn()}>
        <Input name="value" sensitive />
        <FormDebugViewer />
      </Form>,
    );
    expect(debugPayload().values.value).toBe('[REDACTED]');
    first.unmount();
    render(
      <Form initialValues={{ value: 'public' }} onSubmit={vi.fn()}>
        <Input name="value" />
        <FormDebugViewer />
      </Form>,
    );
    expect(debugPayload().values.value).toBe('public');
  });

  it('redacts the registered path even when object references are shared', () => {
    const shared = { value: 'shared-secret' };
    expect(
      redactDebugData({ first: shared, second: shared }, ['second.value']),
    ).toEqual({
      first: { value: 'shared-secret' },
      second: { value: '[REDACTED]' },
    });
    expect(shared.value).toBe('shared-secret');
  });

  it('redacts normalized and raw flat arrays without mutating source data', () => {
    const data = {
      credentials: ['secret'],
      nested: { token: { key: 'private' } },
      public: { name: 'john' },
    };
    expect(
      redactDebugData(data, ['credentials[0].__FLAT__', 'nested.token']),
    ).toEqual({
      credentials: ['[REDACTED]'],
      nested: { token: '[REDACTED]' },
      public: { name: 'john' },
    });
    expect(
      redactDebugData({ credentials: [{ __FLAT__: 'secret' }] }, [
        'credentials.0.__FLAT__',
      ]),
    ).toEqual({ credentials: ['[REDACTED]'] });
    expect(data.credentials[0]).toBe('secret');
    expect(data.nested.token.key).toBe('private');
  });
});
