import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { CSSProperties, JSX } from 'react';
import type { arrayVariants } from './Array';
import type { ArrayElementMethods } from './subcomponents/ArrayElement';

type VariantProps = TVProps<typeof arrayVariants>;
type ClassName = TVClassName<typeof arrayVariants>;

/** provided all data and methods to render a array element */
export type ArrayChildrenRenderFn = (args: {
  /** index of the current element in the array */
  index: number;
  /** total length of the array */
  length: number;
  /** methods of the current element to change the array */
  methods: ArrayElementMethods;
  /** HTML data-testid attribute used in e2e tests of the current element */
  name: string;
  /** field name of the current element */
  testId: string;
}) => JSX.Element;

export interface ArrayFeatures {
  /** enables duplicating existing elements */
  duplicate?: boolean;
  /** enables inserting new elements after existing elements */
  insertAfter?: boolean;
  /** enables sorting by drag-n-drop */
  sortable?: boolean;
}

export interface ArrayProps extends ArrayFeatures, VariantProps {
  /** text of the append element button */
  appendButtonText: string;
  /** function that renders the children with provided Properties. */
  children: ArrayChildrenRenderFn;
  /** CSS class name */
  className?: ClassName;
  /* initial value of a filed that is created in the array */
  elementInitialValue?: unknown;
  /*
   * bottom margin of a list element (default 1rem), this needs to be set as a prop (and not via className slot)
   * because the margin bottom needs to be animated when elements are added or removed
   */
  elementMarginBottom?: CSSProperties['marginBottom'];
  /** label of the array */
  label?: React.ReactNode;
  /** when true (default false) last element can not be removed and will be shown even if array is empty */
  lastElementNotRemovable?: boolean;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}
