import type { CSSProperties, ReactNode } from 'react';
import type { ClassName, VariantProps } from './fieldArrayVariants';
import type { FieldArrayItem } from './subcomponents/FieldArrayControl';
import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';
import type { FieldArrayChildrenRenderFn, FieldArrayFeatures } from './types';

import { flatArrayKey } from '../helpers';
import { useFormContext } from '../hooks/useFormContext';
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
  const { trigger } = useFormContext();
  const {
    fields,
    append,
    remove,
    insert,
    move,
    disableAnimation,
    elementInitialValue,
    getValues,
    testId,
    label,
    required,
    invalid,
    error,
    ids,
  } = useUniformFieldArray({
    name,
    flat,
    elementInitialValue: _elementInitialValue,
    lastElementNotRemovable,
    ...uniformFieldProps,
  });

  // bind row operations here, presentation only arranges the resulting controls
  const items: FieldArrayItem[] = fields.map((field, index) => {
    const elementName = flat
      ? `${name}.${index}.${flatArrayKey}`
      : `${name}.${index}`;
    const elementTestId = `${testId}_${index}`;
    const methods: FieldArrayElementMethods = {
      append: () => {
        append(elementInitialValue);
      },
      duplicate: () => {
        const values = getValues(name);
        const currentValue = (values as unknown[])[index];
        insert(
          index + 1,
          flat ? { [flatArrayKey]: currentValue } : currentValue,
        );
      },
      insert: () => {
        insert(index + 1, elementInitialValue);
      },
      remove: () => {
        remove(index);
      },
    };
    return {
      id: field.id,
      renderProps: {
        index,
        length: fields.length,
        methods,
        name: elementName,
        testId: elementTestId,
      },
    };
  });

  // append an element using the configured initial value
  const handleAppend = () => {
    append(elementInitialValue);
  };

  // validate the array after its row order changes
  const handleMove = (from: number, to: number) => {
    move(from, to);
    trigger(name);
  };

  return (
    <FieldArrayControl
      appendButtonText={appendButtonText}
      className={_className}
      disableAnimation={disableAnimation}
      duplicate={duplicate}
      elementMarginBottom={elementMarginBottom}
      error={error}
      fields={fields}
      ids={ids}
      insertAfter={insertAfter}
      invalid={invalid}
      items={items}
      label={uniformFieldProps.label ? label : undefined}
      lastElementNotRemovable={lastElementNotRemovable}
      name={name}
      onAppend={handleAppend}
      onMove={handleMove}
      required={required}
      sortable={sortable}
      testId={testId}
    >
      {children}
    </FieldArrayControl>
  );
};

export default FieldArray;
