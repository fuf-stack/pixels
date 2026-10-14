import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import FieldArray from '../FieldArray';
import Form from '../Form';
import Input from '../Input';
import FieldCard from './FieldCard';

vi.mock('../hooks/useInput/useInput', () => ({
  useInput: () => {
    throw new Error('Legacy presentation hook invoked');
  },
}));

describe('Owned field group presentation', () => {
  it('names card groups with their visible heading and preserves child registration', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ profile: { name: 'Ada' } }} onSubmit={submit}>
        <FieldCard label="Profile" name="profile">
          <Input label="Name" name="profile.name" />
        </FieldCard>
        <button type="submit">Save</button>
      </Form>,
    );
    const group = screen.getByRole('group', { name: 'Profile' });
    const heading = screen.getByRole('heading', { name: 'Profile' });
    expect(group).toHaveAttribute('aria-labelledby', heading.id);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(submit.mock.calls[0][0]).toEqual({ profile: { name: 'Ada' } });
  });

  it('names array groups without adding a controller and retains initial child values', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ people: [{ name: 'Ada' }] }} onSubmit={submit}>
        <FieldArray label="People" name="people">
          {({ name }) => <Input label="Name" name={`${name}.name`} />}
        </FieldArray>
        <button type="submit">Save</button>
      </Form>,
    );
    const group = screen.getByRole('group', { name: 'People' });
    const heading = screen.getByRole('heading', { name: 'People' });
    expect(group).toHaveAttribute('aria-labelledby', heading.id);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(submit.mock.calls[0][0]).toEqual({ people: [{ name: 'Ada' }] });
  });
});
