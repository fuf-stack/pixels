/* eslint-disable import-x/prefer-default-export */

import type { VetoIssueLike } from './normalizeIssue';
import type { SerializedSchema } from './serialize';
import type {
  VetoFormattedError,
  VetoSchema,
  VetoTypeAny,
  VetoUnformattedError,
} from './types';

import { issueCodes } from './issueCodes';
import { normalizeIssue } from './normalizeIssue';
import { checkSerializedSchemaPath } from './serialize';

const isObjectLikeSchemaType = (schemaType: unknown) => {
  return schemaType === 'array' || schemaType === 'object';
};

const isObjectLikeSerializedSchema = (schema?: SerializedSchema | null) => {
  if (!schema) {
    return false;
  }

  if (isObjectLikeSchemaType(schema.type)) {
    return true;
  }

  const schemaBranches = [schema.oneOf, schema.anyOf, schema.allOf]
    .filter(Array.isArray)
    .flat()
    .filter((value): value is SerializedSchema => {
      return !!value && typeof value === 'object' && !Array.isArray(value);
    });

  return schemaBranches.some(isObjectLikeSerializedSchema);
};

/**
 * Checks if a given schema path corresponds to an object-like error structure.
 *
 * Used by {@link finalizeIssueTree} to decide whether issues at a path should
 * be nested under `_errors` (object-like: object/array/union of those) or
 * placed directly as an array (scalar leaves).
 *
 * @param schema - The schema to check
 * @param errorPath - Optional path to check within the schema
 */
const checkIsObjectLikeError = (
  schema: VetoTypeAny,
  errorPath?: (string | number)[],
) => {
  return checkSerializedSchemaPath(
    schema,
    (pathType) => {
      return isObjectLikeSerializedSchema(pathType);
    },
    errorPath ?? undefined,
  );
};

interface VetoIssueTreeNode {
  _errors: VetoIssueLike[];
  [key: string]: VetoIssueTreeNode | VetoIssueLike[] | undefined;
}

const createIssueTreeNode = (): VetoIssueTreeNode => {
  return { _errors: [] };
};

const addIssueToTree = (root: VetoIssueTreeNode, issue: VetoIssueLike) => {
  const issuePath = Array.isArray(issue.path) ? issue.path : [];
  const issuePathSegments = issuePath.map(String);

  let currentNode = root;
  issuePathSegments.forEach((segment) => {
    const existingNode = currentNode[segment];
    if (
      !existingNode ||
      Array.isArray(existingNode) ||
      typeof existingNode !== 'object'
    ) {
      currentNode[segment] = createIssueTreeNode();
    }

    currentNode = currentNode[segment] as VetoIssueTreeNode;
  });

  currentNode._errors.push({
    ...issue,
    _errorPath: issuePath,
  });
};

/**
 * Formats single zod error to veto error format
 * @param zodError - The Zod error to format
 */
const formatVetoError = (zodError: VetoIssueLike) => {
  let errorFormatted = normalizeIssue(zodError);

  // move params of of custom errors to top level (remove params)
  if (errorFormatted.code === issueCodes.custom && errorFormatted.params) {
    const { params, ...rest } = errorFormatted as VetoIssueLike & {
      params?: Record<string, unknown>;
    };
    errorFormatted = { ...rest, ...params };
  }

  // Remove internal metadata from formatted error.
  delete errorFormatted.input;
  delete errorFormatted.inst;
  delete errorFormatted._errorPath;
  delete errorFormatted.path;

  return errorFormatted;
};

interface FinalizedIssueTreeNode {
  _errors?: VetoIssueLike[];
  [key: string]: FinalizedIssueTree;
}
type FinalizedIssueTree = VetoIssueLike[] | FinalizedIssueTreeNode | undefined;

const finalizeIssueTree = (
  issueTreeNode: VetoIssueTreeNode,
  schema: VetoSchema,
): FinalizedIssueTree => {
  const childEntries = Object.entries(issueTreeNode)
    .filter(([key]) => {
      return key !== '_errors';
    })
    .map(([key, value]): [string, FinalizedIssueTree] => {
      if (!value || Array.isArray(value) || typeof value !== 'object') {
        return [key, undefined];
      }
      return [key, finalizeIssueTree(value, schema)];
    })
    .filter((entry): entry is [string, FinalizedIssueTree] => {
      return entry[1] !== undefined;
    });

  const childValues: Record<string, FinalizedIssueTree> =
    Object.fromEntries(childEntries);
  const hasChildValues = Object.keys(childValues).length > 0;

  if (!issueTreeNode._errors.length) {
    return hasChildValues ? childValues : undefined;
  }

  const errorPath = issueTreeNode._errors[0]?._errorPath;
  const formattedErrors = issueTreeNode._errors.map(formatVetoError);

  if (checkIsObjectLikeError(schema as VetoTypeAny, errorPath)) {
    return { ...childValues, _errors: formattedErrors };
  }

  return formattedErrors;
};

/**
 * Converts a raw Zod validation error into veto's nested error format.
 *
 * Each Zod issue is placed into a tree keyed by its `path`, then each leaf
 * is normalized via {@link normalizeIssue} (which adapts Zod v4's issue
 * shape back to veto's v0 contract).
 *
 * @param error - Raw validation error
 * @param schema - Schema that generated the error
 * @returns Formatted veto error object
 */
export const formatError = (
  error: VetoUnformattedError,
  schema: VetoSchema,
): VetoFormattedError => {
  const issueTree = createIssueTreeNode();

  error.issues.forEach((issue) => {
    addIssueToTree(issueTree, issue as VetoIssueLike);
  });

  const formatted = finalizeIssueTree(issueTree, schema);

  if (formatted && typeof formatted === 'object' && !Array.isArray(formatted)) {
    return formatted as VetoFormattedError;
  }

  return {
    _errors: (Array.isArray(formatted)
      ? formatted
      : []) as VetoFormattedError['_errors'],
  };
};
