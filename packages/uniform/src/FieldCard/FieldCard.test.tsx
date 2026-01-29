import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import {
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from './FieldCard';
// eslint-disable-next-line import-x/no-namespace
import * as stories from './FieldCard.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
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
