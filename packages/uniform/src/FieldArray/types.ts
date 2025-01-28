import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { JSX } from 'react';
import type { fieldArrayVariants } from './FieldArray';
import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';

type VariantProps = TVProps<typeof fieldArrayVariants>;
type ClassName = TVClassName<typeof fieldArrayVariants>;

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

export interface FieldArrayProps extends FieldArrayFeatures, VariantProps {
  /** text of the append element button */
  appendButtonText: string;
  /** function that renders the children with provided Properties. */
  children: FieldArrayChildrenRenderFn;
  /** CSS class name */
  className?: ClassName;
  /* initial value of a filed that is created in the array */
  elementInitialValue?: unknown;
  /** label of the field array */
  label?: React.ReactNode;
  /** when true (default false) last element can not be removed and will be shown even if field array is empty */
  lastElementNotRemovable?: boolean;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}
