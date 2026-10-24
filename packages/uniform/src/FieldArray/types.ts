import type { JSX } from 'react';
import type { FieldArrayItem } from '../hooks/useUniformFieldArray/types';

/** provided all data and methods to render a field array element */
export type FieldArrayChildrenRenderFn = (
  args: FieldArrayItem['renderProps'],
) => JSX.Element;

export interface FieldArrayFeatures {
  /** enables duplicating existing elements */
  duplicate?: boolean;
  /** enables inserting new elements after existing elements */
  insertAfter?: boolean;
  /** enables sorting by drag-n-drop */
  sortable?: boolean;
}

export type { FieldArrayProps } from './FieldArray';
