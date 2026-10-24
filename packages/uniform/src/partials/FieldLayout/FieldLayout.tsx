import type {
  ComponentProps,
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
} from 'react';
import type { FieldIds } from '../types';

import FieldDescription from '../FieldDescription/FieldDescription';
import FieldLabel from '../FieldLabel/FieldLabel';

type ClassName = Partial<
  Record<
    'base' | 'description' | 'errorMessage' | 'helperWrapper' | 'label',
    string
  >
>;

type BaseProps<TBase extends ElementType> = Omit<
  ComponentPropsWithRef<TBase>,
  'children' | 'className' | 'dangerouslySetInnerHTML'
> &
  Record<`data-${string}`, string | number | boolean | undefined>;

// require the configuration when the base has props the layout cannot supply
type BaseConfiguration<TBase extends ElementType> =
  Record<never, never> extends BaseProps<TBase>
    ? { baseProps?: BaseProps<TBase> }
    : { baseProps: BaseProps<TBase> };

interface FieldLayoutProps<TBase extends ElementType> {
  /** Component or element used for the base slot */
  baseAs?: TBase;
  /** Attributes, interactions and ref for the base element */
  baseProps?: BaseProps<NoInfer<TBase>>;
  /** Editable field content */
  children: ReactNode;
  /** CSS class name */
  className: ClassName;
  /** Help text */
  description?: ReactNode;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** IDs shared with the editable control */
  ids: FieldIds;
  /** Shows the validation message */
  invalid: boolean;
  /** Field label */
  label?: ReactNode;
  /** Label element, use React Aria Label inside group engines */
  labelAs?: ComponentProps<typeof FieldLabel>['as'];
  /** Shows the required indicator */
  required?: boolean;
}

/**
 * Default arrangement of a field label, editable content and supporting messages
 *
 * Renders the base component around the label, content and messages
 * Receives IDs, resolved classes and validation state
 */
const FieldLayout = <TBase extends ElementType = 'div'>({
  baseAs = undefined,
  baseProps = undefined,
  children,
  className,
  description = undefined,
  errorMessage,
  ids,
  invalid,
  label = undefined,
  labelAs = 'label',
  required = false,
}: FieldLayoutProps<TBase> & BaseConfiguration<NoInfer<TBase>>) => {
  const Base = baseAs ?? 'div';

  return (
    <Base {...baseProps} className={className.base} data-slot="base">
      {/* field label */}
      <FieldLabel
        as={labelAs}
        className={className.label}
        htmlFor={labelAs === 'label' ? ids.control : undefined}
        id={ids.label}
        required={required}
      >
        {label}
      </FieldLabel>

      {/* editable content */}
      {children}

      {/* help text and validation messages */}
      {description || invalid ? (
        <div className={className.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={className.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={className.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </Base>
  );
};

export default FieldLayout;
