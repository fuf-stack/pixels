import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import FieldArray from '../FieldArray';
import Form from '../Form';
import Input from '../Input';
import FieldCard, {
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from './FieldCard';
import * as edgeCaseStories from './stories/FieldCard.edge-cases.stories';
import * as stories from './stories/FieldCard.stories';

describe('Story Snapshots', () => {
  // keep existing unit snapshot scenarios, composition interactions also run in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    WithInitialValues: stories.WithInitialValues,
    Required: stories.Required,
    AllOptional: stories.AllOptional,
    CrossFieldValidation: stories.CrossFieldValidation,
    ObjectLevelError: stories.ObjectLevelError,
    ErrorStylingBehavior: stories.ErrorStylingBehavior,
  });
  storySnapshots(edgeCaseStories);
});

describe('hasVisibleChildErrors', () => {
  it('returns false when errors is undefined', () => {
    expect(hasVisibleChildErrors(undefined, { field: true })).toBe(false);
  });

  it('returns false when touched is undefined', () => {
    expect(hasVisibleChildErrors({ field: ['error'] }, undefined)).toBe(false);
  });

  it('returns false when both are empty objects', () => {
    expect(hasVisibleChildErrors({}, {})).toBe(false);
  });

  it('returns true when a touched field has an error', () => {
    const errors = { name: ['Name is required'] };
    const touched = { name: true };
    expect(hasVisibleChildErrors(errors, touched)).toBe(true);
  });

  it('returns false when field has error but is not touched', () => {
    const errors = { name: ['Name is required'] };
    const touched = {};
    expect(hasVisibleChildErrors(errors, touched)).toBe(false);
  });

  it('returns false when field is touched but has no error', () => {
    const errors = {};
    const touched = { name: true };
    expect(hasVisibleChildErrors(errors, touched)).toBe(false);
  });

  it('ignores _errors key (object-level errors)', () => {
    const errors = { _errors: ['Object level error'] };
    const touched = { _errors: true };
    expect(hasVisibleChildErrors(errors, touched)).toBe(false);
  });

  it('handles nested objects - returns true when nested field is touched with error', () => {
    const errors = { address: { street: ['Street is required'] } };
    const touched = { address: { street: true } };
    expect(hasVisibleChildErrors(errors, touched)).toBe(true);
  });

  it('handles nested objects - returns false when nested field has error but not touched', () => {
    const errors = { address: { street: ['Street is required'] } };
    const touched = { address: {} };
    expect(hasVisibleChildErrors(errors, touched)).toBe(false);
  });

  it('handles mixed touched/untouched siblings', () => {
    const errors = {
      name: ['Name is required'],
      email: ['Email is required'],
    };
    const touched = { email: true }; // only email is touched
    expect(hasVisibleChildErrors(errors, touched)).toBe(true);
  });

  it('returns false when only untouched fields have errors', () => {
    const errors = {
      name: ['Name is required'],
      email: ['Email is required'],
    };
    const touched = { other: true }; // different field is touched
    expect(hasVisibleChildErrors(errors, touched)).toBe(false);
  });

  it('handles deeply nested structures', () => {
    const errors = {
      user: {
        profile: {
          address: {
            city: ['City is required'],
          },
        },
      },
    };
    const touched = {
      user: {
        profile: {
          address: {
            city: true,
          },
        },
      },
    };
    expect(hasVisibleChildErrors(errors, touched)).toBe(true);
  });
});

describe('hasAnyChildErrors', () => {
  it('returns false when errors is undefined', () => {
    expect(hasAnyChildErrors(undefined)).toBe(false);
  });

  it('returns false when errors is empty object', () => {
    expect(hasAnyChildErrors({})).toBe(false);
  });

  it('returns true when a field has an error', () => {
    const errors = { name: ['Name is required'] };
    expect(hasAnyChildErrors(errors)).toBe(true);
  });

  it('ignores _errors key (object-level errors)', () => {
    const errors = { _errors: ['Object level error'] };
    expect(hasAnyChildErrors(errors)).toBe(false);
  });

  it('returns true for nested errors', () => {
    const errors = { address: { street: ['Street is required'] } };
    expect(hasAnyChildErrors(errors)).toBe(true);
  });

  it('returns false when only _errors exists in nested object', () => {
    const errors = { address: { _errors: ['Address incomplete'] } };
    expect(hasAnyChildErrors(errors)).toBe(false);
  });

  it('handles deeply nested structures', () => {
    const errors = {
      user: {
        profile: {
          address: {
            city: ['City is required'],
          },
        },
      },
    };
    expect(hasAnyChildErrors(errors)).toBe(true);
  });
});

describe('hasAnyChildTouched', () => {
  it('returns false when touched is undefined', () => {
    expect(hasAnyChildTouched(undefined)).toBe(false);
  });

  it('returns false when touched is empty object', () => {
    expect(hasAnyChildTouched({})).toBe(false);
  });

  it('returns true when a field is touched', () => {
    const touched = { name: true };
    expect(hasAnyChildTouched(touched)).toBe(true);
  });

  it('returns false when field is not touched (false)', () => {
    const touched = { name: false };
    expect(hasAnyChildTouched(touched)).toBe(false);
  });

  it('ignores _errors key', () => {
    const touched = { _errors: true };
    expect(hasAnyChildTouched(touched)).toBe(false);
  });

  it('returns true for nested touched fields', () => {
    const touched = { address: { street: true } };
    expect(hasAnyChildTouched(touched)).toBe(true);
  });

  it('returns false when nested field is not touched', () => {
    const touched = { address: { street: false } };
    expect(hasAnyChildTouched(touched)).toBe(false);
  });

  it('handles mixed touched/untouched siblings', () => {
    const touched = { name: false, email: true };
    expect(hasAnyChildTouched(touched)).toBe(true);
  });

  it('handles deeply nested structures', () => {
    const touched = {
      user: {
        profile: {
          address: {
            city: true,
          },
        },
      },
    };
    expect(hasAnyChildTouched(touched)).toBe(true);
  });
});

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
