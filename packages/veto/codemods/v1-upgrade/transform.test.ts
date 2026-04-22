import { describe, expect, it } from 'vitest';

import { transformSource } from './transform';

describe('veto v1 codemod', () => {
  it('renames SzType imports to SerializedSchema', () => {
    const source = [
      "import type { SzType } from '@fuf-stack/veto';",
      '',
      'const isString = (schema: SzType | null) => schema?.type === "string";',
    ].join('\n');

    const result = transformSource(source);

    expect(result.changed).toBe(true);
    expect(result.code).toContain(
      "import type { SerializedSchema as SzType } from '@fuf-stack/veto';",
    );
    expect(result.code).toContain('schema: SzType | null');
  });

  it('reports warnings for legacy zodex schema tags', () => {
    const source = [
      "if (pathType?.type === 'discriminatedUnion') {",
      '  return true;',
      '}',
    ].join('\n');

    const result = transformSource(source);

    expect(result.changed).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      kind: 'legacy-schema-tag',
      line: 1,
      tag: 'discriminatedUnion',
    });
  });

  it('keeps unrelated files unchanged', () => {
    const source = [
      "import { veto } from '@fuf-stack/veto';",
      '',
      'const validator = veto({ name: "value" as never });',
    ].join('\n');

    const result = transformSource(source);

    expect(result.changed).toBe(false);
    expect(result.code).toBe(source);
    expect(result.warnings).toHaveLength(0);
  });
});
