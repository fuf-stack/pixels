export interface CodemodWarning {
  kind: 'legacy-schema-tag';
  line: number;
  message: string;
  suggestion: string;
  tag: string;
}

export interface TransformResult {
  changed: boolean;
  code: string;
  warnings: CodemodWarning[];
}

const LEGACY_TAG_SUGGESTIONS: Record<string, string> = {
  discriminatedUnion:
    "Replace `.type === 'discriminatedUnion'` checks with JSON Schema branch checks such as `Array.isArray(schema.oneOf)`/`Array.isArray(schema.anyOf)`.",
  intersection:
    "Replace `.type === 'intersection'` checks with JSON Schema `allOf` checks, e.g. `Array.isArray(schema.allOf)`.",
  record:
    "Replace `.type === 'record'` checks with JSON Schema `additionalProperties` checks, e.g. `typeof schema.additionalProperties === 'object'`.",
};

const TYPE_IMPORT_RE =
  /import\s+type\s*\{[^}]*\}\s*from\s*['"]@fuf-stack\/veto(?:\/serialize)?['"];?/g;

const LEGACY_TAG_REGEXES = [
  /\.type\s*===\s*['"](discriminatedUnion|intersection|record)['"]/g,
  /['"](discriminatedUnion|intersection|record)['"]\s*===\s*[^;\n]*\.type/g,
  /case\s+['"](discriminatedUnion|intersection|record)['"]/g,
] as const;

const getLineNumber = (source: string, index: number): number => {
  return source.slice(0, index).split('\n').length;
};

export const transformSource = (source: string): TransformResult => {
  let changed = false;
  const nextSource = source.replace(
    TYPE_IMPORT_RE,
    (fullImport: string): string => {
      if (!fullImport.includes('SzType')) {
        return fullImport;
      }

      const importSpecifiersMatch = /\{([^}]*)\}/.exec(fullImport);
      if (!importSpecifiersMatch) {
        return fullImport;
      }

      const updatedSpecifiers = importSpecifiersMatch[1]
        .split(',')
        .map((part) => {
          return part.trim();
        })
        .map((specifier) => {
          if (specifier === 'SzType') {
            return 'SerializedSchema as SzType';
          }
          if (specifier.startsWith('SzType as ')) {
            const alias = specifier.replace('SzType as ', '').trim();
            return `SerializedSchema as ${alias}`;
          }
          return specifier;
        })
        .join(', ');

      const updatedImport = fullImport.replace(
        /\{[^}]*\}/,
        `{ ${updatedSpecifiers} }`,
      );
      if (updatedImport !== fullImport) {
        changed = true;
      }
      return updatedImport;
    },
  );

  const warnings: CodemodWarning[] = [];
  LEGACY_TAG_REGEXES.forEach((regex) => {
    let tagMatch = regex.exec(nextSource);
    while (tagMatch) {
      const matchedTag = tagMatch[1];
      if (matchedTag) {
        warnings.push({
          kind: 'legacy-schema-tag',
          line: getLineNumber(nextSource, tagMatch.index),
          message: `Detected legacy zodex schema tag '${matchedTag}'.`,
          suggestion: LEGACY_TAG_SUGGESTIONS[matchedTag],
          tag: matchedTag,
        });
      }
      tagMatch = regex.exec(nextSource);
    }
  });

  return {
    changed,
    code: nextSource,
    warnings,
  };
};
