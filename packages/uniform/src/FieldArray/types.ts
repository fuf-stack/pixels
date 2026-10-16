import type { JSX } from 'react';
import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';

/** provided all data and methods to render a field array element */
export type FieldArrayChildrenRenderFn = (args: {
  /** index of the current element in the field array */
  index: number;
  /** total length of the field array */
  length: number;
  /** methods of the current element to change the field array */
  methods: FieldArrayElementMethods;
  /** HTML data-testid attribute used in e2e tests of the current element */
  name: string;
  /** field name of the current element */
  testId: string;
}) => JSX.Element;

export interface FieldArrayFeatures {
  /** enables duplicating existing elements */
  duplicate?: boolean;
  /** enables inserting new elements after existing elements */
  insertAfter?: boolean;
  /** enables sorting by drag-n-drop */
  sortable?: boolean;
}

export type { FieldArrayProps } from './FieldArray';
