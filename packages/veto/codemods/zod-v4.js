/**
 * Codemod for migrating from veto (Zod v3) to veto (Zod v4)
 *
 * Usage:
 *   npx jscodeshift -t @fuf-stack/veto/codemods/zod-v4.js src/
 *
 * Or with ts-jscodeshift for TypeScript:
 *   npx jscodeshift -t @fuf-stack/veto/codemods/zod-v4.js --parser=tsx src/
 *
 * Transformations:
 * 1. z.record(valueSchema) -> z.record(z.string(), valueSchema)
 * 2. error.type -> error.origin (in too_small/too_big contexts)
 * 3. error.received -> error.input
 * 4. schema.anyOf -> (schema.anyOf || schema.oneOf)
 * 5. SzType -> JSONSchema import
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Transform z.record(valueSchema) -> z.record(z.string(), valueSchema)
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { name: 'record' },
      },
    })
    .forEach((path) => {
      // Check if callee object is 'z' or a variable that could be zod
      const calleeObj = path.node.callee.object;
      if (calleeObj.type === 'Identifier' && calleeObj.name === 'z') {
        // Check if it has only one argument
        if (path.node.arguments.length === 1) {
          // Insert z.string() as the first argument
          path.node.arguments.unshift(
            j.callExpression(
              j.memberExpression(j.identifier('z'), j.identifier('string')),
              [],
            ),
          );
          hasChanges = true;
        }
      }
    });

  // Also handle imported record function: record(valueSchema)
  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'record' },
    })
    .forEach((path) => {
      // Check if record is imported from veto/zod
      if (path.node.arguments.length === 1) {
        // Look for import of record
        const recordImports = root.find(j.ImportSpecifier, {
          imported: { name: 'record' },
        });

        if (recordImports.length > 0) {
          // Check if string is also imported
          const stringImports = root.find(j.ImportSpecifier, {
            imported: { name: 'string' },
          });

          if (stringImports.length > 0) {
            // Insert string() as the first argument
            path.node.arguments.unshift(
              j.callExpression(j.identifier('string'), []),
            );
            hasChanges = true;
          } else {
            // Insert z.string() and assume z is available
            path.node.arguments.unshift(
              j.callExpression(
                j.memberExpression(j.identifier('z'), j.identifier('string')),
                [],
              ),
            );
            hasChanges = true;
          }
        }
      }
    });

  // 2. Transform error.type -> error.origin (in validation error contexts)
  // This is a heuristic transformation - it looks for .type access on objects
  // that might be validation errors (objects with .code property access nearby)
  root
    .find(j.MemberExpression, {
      property: { name: 'type' },
    })
    .forEach((path) => {
      // Check if this looks like it's in an error context
      // by looking for nearby .code, .message, or .minimum/.maximum accesses
      const { parent } = path;
      if (parent && parent.node) {
        // Check if the object has other error-like property accesses
        const objectName = path.node.object.name;
        if (objectName) {
          const errorLikeProperties = root.find(j.MemberExpression, {
            object: { name: objectName },
            property: {
              name: (name) => {
                return ['code', 'minimum', 'maximum', 'inclusive'].includes(
                  name,
                );
              },
            },
          });

          if (errorLikeProperties.length > 0) {
            // This looks like an error object, change type to origin
            path.node.property.name = 'origin';
            hasChanges = true;
          }
        }
      }
    });

  // 3. Transform error.received -> error.input
  root
    .find(j.MemberExpression, {
      property: { name: 'received' },
    })
    .forEach((path) => {
      // Check if this looks like it's in an error context
      const objectName = path.node.object.name;
      if (objectName) {
        const errorLikeProperties = root.find(j.MemberExpression, {
          object: { name: objectName },
          property: {
            name: (name) => {
              return ['code', 'expected', 'message'].includes(name);
            },
          },
        });

        if (errorLikeProperties.length > 0) {
          path.node.property.name = 'input';
          hasChanges = true;
        }
      }
    });

  // 4. Transform schema.anyOf checks to include oneOf
  // Find: if (schema.anyOf) or schema.anyOf &&
  root
    .find(j.MemberExpression, {
      property: { name: 'anyOf' },
    })
    .forEach((path) => {
      const { parent } = path;
      // Check if this is used in a condition (if statement or logical expression)
      if (
        parent.node.type === 'IfStatement' ||
        parent.node.type === 'ConditionalExpression' ||
        parent.node.type === 'LogicalExpression'
      ) {
        // Replace schema.anyOf with (schema.anyOf || schema.oneOf)
        const objectNode = path.node.object;
        j(path).replaceWith(
          j.logicalExpression(
            '||',
            j.memberExpression(
              j.identifier(objectNode.name || 'schema'),
              j.identifier('anyOf'),
            ),
            j.memberExpression(
              j.identifier(objectNode.name || 'schema'),
              j.identifier('oneOf'),
            ),
          ),
        );
        hasChanges = true;
      }
    });

  // 5. Transform SzType import to JSONSchema
  root
    .find(j.ImportSpecifier, {
      imported: { name: 'SzType' },
    })
    .forEach((path) => {
      path.node.imported.name = 'JSONSchema';
      if (path.node.local && path.node.local.name === 'SzType') {
        path.node.local.name = 'JSONSchema';
      }
      hasChanges = true;
    });

  // Also rename SzType usage in type annotations
  root.find(j.Identifier, { name: 'SzType' }).forEach((path) => {
    // Don't rename if it's an import specifier (already handled above)
    if (path.parent.node.type !== 'ImportSpecifier') {
      path.node.name = 'JSONSchema';
      hasChanges = true;
    }
  });

  // Return the modified source if changes were made
  if (hasChanges) {
    return root.toSource({ quote: 'single' });
  }

  return null;
};

// Export metadata for jscodeshift
module.exports.parser = 'tsx';
