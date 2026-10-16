import type { CSSProperties, ReactNode } from 'react';
import type { ClassName, VariantProps } from './fieldArrayVariants';
import type { FieldArrayChildrenRenderFn, FieldArrayFeatures } from './types';

import useUniformFieldArray from '../hooks/useUniformFieldArray/useUniformFieldArray';
import FieldArrayControl from './subcomponents/FieldArrayControl';

export { fieldArrayVariants } from './fieldArrayVariants';

export interface FieldArrayProps extends FieldArrayFeatures, VariantProps {
  /** text of the append element button */
  appendButtonText?: string;
  /** function that renders the children with provided Properties. */
  children: FieldArrayChildrenRenderFn;
  /** CSS class name */
  className?: ClassName;
  /* initial value of a filed that is created in the array */
  elementInitialValue?: unknown;
  /*
   * bottom margin of a list element (default 1rem), this needs to be set as a prop (and not via className slot)
   * because the margin bottom needs to be animated when elements are added or removed
   */
  elementMarginBottom?: CSSProperties['marginBottom'];
  /** when true, array stores primitives as wrapper objects: { __FLAT__: value } */
  flat?: boolean;
  /** Field label */
  label?: ReactNode;
  /** when true (default false) last element can not be removed and will be shown even if field array is empty */
  lastElementNotRemovable?: boolean;
  /** Field name */
  name: string;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Form field group for adding, removing and reordering array entries */
const FieldArray = ({
  appendButtonText = 'Add Element',
  children,
  className: _className = undefined,
  duplicate = false,
  elementInitialValue: _elementInitialValue = null,
  elementMarginBottom = undefined,
  flat = false,
  insertAfter = false,
  lastElementNotRemovable = false,
  name,
  sortable = false,
  ...uniformFieldProps
}: FieldArrayProps) => {
  const { field, fields, appendItem, items, moveItem, disableAnimation } =
    useUniformFieldArray({
      name,
      flat,
      elementInitialValue: _elementInitialValue,
      lastElementNotRemovable,
      ...uniformFieldProps,
    });

  return (
    <FieldArrayControl
      appendButtonText={appendButtonText}
      className={_className}
      disableAnimation={disableAnimation}
      duplicate={duplicate}
      elementMarginBottom={elementMarginBottom}
      field={field}
      fields={fields}
      insertAfter={insertAfter}
      items={items}
      lastElementNotRemovable={lastElementNotRemovable}
      onAppend={appendItem}
      onMove={moveItem}
      sortable={sortable}
    >
      {children}
    </FieldArrayControl>
  );
};

export default FieldArray;
