import { describe, expect, it } from 'vitest';

import omitDisabledValues from './disabledFields';

describe('omitDisabledValues', () => {
  it('keeps all values when no fields are disabled', () => {
    const values = {
      name: 'Ada',
      count: 0,
      active: false,
      empty: '',
      nullable: null,
    };

    expect(omitDisabledValues(values, [])).toStrictEqual(values);
  });

  it('removes disabled properties while preserving enabled falsy values', () => {
    const values = Object.freeze({
      excluded: 'stored',
      count: 0,
      active: false,
      empty: '',
      nullable: null,
    });

    expect(omitDisabledValues(values, ['excluded'])).toStrictEqual({
      count: 0,
      active: false,
      empty: '',
      nullable: null,
    });
    expect(values.excluded).toBe('stored');
  });

  it('removes nested values without mutating frozen form state', () => {
    const profile = Object.freeze({ email: 'ada@example.com', name: 'Ada' });
    const values = Object.freeze({ profile, enabled: 'keep' });

    expect(omitDisabledValues(values, ['profile.email'])).toStrictEqual({
      profile: { name: 'Ada' },
      enabled: 'keep',
    });
    expect(values.profile).toStrictEqual({
      email: 'ada@example.com',
      name: 'Ada',
    });
  });

  it.each(['rows.1.name', 'rows[1].name'])(
    'only removes the targeted array-row property for %s',
    (name) => {
      const rows = Object.freeze([
        Object.freeze({ name: 'first', code: 'a' }),
        Object.freeze({ name: 'second', code: 'b' }),
        Object.freeze({ name: 'third', code: 'c' }),
      ]);
      const values = Object.freeze({ rows });

      expect(omitDisabledValues(values, [name])).toStrictEqual({
        rows: [
          { name: 'first', code: 'a' },
          { code: 'b' },
          { name: 'third', code: 'c' },
        ],
      });
      expect(values.rows[1]).toStrictEqual({ name: 'second', code: 'b' });
    },
  );

  it.each(['tags.1', 'tags[1]', 'tags.1.__FLAT__', 'tags[1].__FLAT__'])(
    'removes an array value without shifting later indices for %s',
    (name) => {
      const values = Object.freeze({
        tags: Object.freeze(['first', 'excluded', 'third']),
      });

      const result = omitDisabledValues(values, [name]);

      expect(result).toHaveProperty('tags.length', 3);
      expect(result).toHaveProperty('tags.0', 'first');
      expect(result).not.toHaveProperty('tags.1');
      expect(result).toHaveProperty('tags.2', 'third');
      expect(values.tags).toStrictEqual(['first', 'excluded', 'third']);
    },
  );

  it.each([
    ['tags.0.__FLAT__', 'tags.1.__FLAT__'],
    ['tags.1.__FLAT__', 'tags.0.__FLAT__'],
  ])('preserves every omitted array slot for %s then %s', (first, second) => {
    const values = Object.freeze({
      tags: Object.freeze(['first', 'second', 'third']),
    });

    const result = omitDisabledValues(values, [first, second]);

    expect(result).toHaveProperty('tags.length', 3);
    expect(result).not.toHaveProperty('tags.0');
    expect(result).not.toHaveProperty('tags.1');
    expect(result).toHaveProperty('tags.2', 'third');
    expect(values.tags).toStrictEqual(['first', 'second', 'third']);
  });

  it('ignores missing paths and paths through primitive or nullish values', () => {
    const values = {
      profile: { name: 'Ada' },
      nullable: null,
      absent: undefined,
      zero: 0,
      active: false,
    };

    expect(
      omitDisabledValues(values, [
        'missing.child',
        'profile.missing',
        'profile.name.child',
        'nullable.child',
        'absent.child',
        'zero.child',
        'active.child',
      ]),
    ).toStrictEqual(values);
  });

  it('handles duplicate and overlapping parent/child paths in either order', () => {
    const values = Object.freeze({
      profile: Object.freeze({ email: 'ada@example.com' }),
      enabled: 'keep',
    });

    expect(
      omitDisabledValues(values, ['profile', 'profile.email', 'profile']),
    ).toStrictEqual({ enabled: 'keep' });
    expect(
      omitDisabledValues(values, ['profile.email', 'profile']),
    ).toStrictEqual({ enabled: 'keep' });
    expect(values.profile.email).toBe('ada@example.com');
  });

  it('ignores inherited properties', () => {
    const values = { enabled: 'keep' };

    expect(omitDisabledValues(values, ['toString.name'])).toBe(values);
  });
});
