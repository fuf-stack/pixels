import { expect, it } from 'vitest';

import { slugify } from './slugify';

it('enforces lowercase', () => {
  expect(slugify('UPPERCasE')).toEqual('uppercase');
});

it('keeps dots', () => {
  expect(slugify('with.dots')).toEqual('with.dots');
});

it('replaces spaces and hyphens with underscores', () => {
  expect(slugify('with spaces and-hyphens')).toEqual('with_spaces_and_hyphens');
});

it('allows to specify alternative replacement character in options', () => {
  expect(slugify('with spaces and-hyphens', { replacement: '-' })).toEqual(
    'with-spaces-and-hyphens',
  );
});

it('removes special characters :+/\\@()', () => {
  expect(slugify('with:+/\\@()')).toEqual('with');
});

it('removes unicode characters', () => {
  expect(slugify('i ♥ unicode')).toEqual('i_unicode');
});
