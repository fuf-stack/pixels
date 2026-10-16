import type { FieldPresentationProps } from '../../partials/types';
import type { RadioTabsProps } from '../RadioTabs';

import { useFocusWithin } from 'react-aria/useFocusWithin';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { radioTabsVariants } from '../radioTabsVariants';
import RadioTabsList from './RadioTabsList';

interface RadioTabsControlProps
  extends
    Pick<
      RadioTabsProps,
      | 'className'
      | 'description'
      | 'disabled'
      | 'fullWidth'
      | 'inline'
      | 'label'
      | 'options'
      | 'variant'
    >,
    FieldPresentationProps<unknown, string> {
  /** Custom accessible name */
  ariaLabel: string;
  /** Connects form focus requests to an enabled tab */
  inputRef: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Tab selection presentation with group messages and keyboard focus routing
 *
 * @see https://react-aria.adobe.com/Tabs
 */
const RadioTabsControl = ({
  ariaLabel,
  className,
  controlProps,
  description,
  disabled,
  errorMessage,
  fullWidth,
  ids,
  inline,
  inputRef,
  invalid,
  label,
  onBlur,
  onValueChange,
  options,
  required,
  testId,
  value,
  variant,
}: RadioTabsControlProps) => {
  const { focusWithinProps } = useFocusWithin({ onBlurWithin: onBlur });

  // check if any option has content
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/promise-function-async
  const hasContent = options.some((option) => {
    return option.content;
  });

  // classNames from slots
  const styling = useStyling();
  const variants = styling.resolve(radioTabsVariants, {
    fullWidth,
    hasContent,
    isInvalid: invalid,
    appearance: variant ?? 'solid',
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // required-selection text supplies the group announcement
  const { 'aria-required': _ariaRequired, ...associations } = controlProps;
  const describedBy =
    [
      associations['aria-describedby'],
      required ? `${ids.control}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // route form focus to the selected enabled tab, otherwise the first enabled tab
  const handleControlRef = (node: HTMLDivElement | null) => {
    inputRef(
      node
        ? {
            focus: () => {
              const tab =
                node.querySelector<HTMLElement>(
                  '[role="tab"][aria-selected="true"]:not([disabled]):not([aria-disabled="true"])',
                ) ??
                node.querySelector<HTMLElement>(
                  '[role="tab"]:not([disabled]):not([aria-disabled="true"])',
                );
              tab?.focus();
            },
          }
        : null,
    );
  };

  // keep option test IDs stable when values contain dots
  const getOptionTestId = (
    optionValue: string | number | boolean,
    explicit?: string,
  ) => {
    return slugify(`${testId}_option_${explicit ?? optionValue}`, {
      replaceDots: true,
    });
  };

  return (
    <div
      {...associations}
      {...focusWithinProps}
      ref={handleControlRef}
      aria-describedby={describedBy}
      className={classNames.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      role="group"
    >
      {label ? (
        <FieldLabel
          as="div"
          className={classNames.label}
          id={ids.label}
          required={required}
        >
          {label}
        </FieldLabel>
      ) : null}
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <div
        className={styling.cn(
          'flex flex-col flex-wrap gap-2',
          inline ? 'flex-row' : undefined,
          classNames.wrapper,
        )}
        data-slot="wrapper"
      >
        <RadioTabsList
          className={classNames}
          describedBy={describedBy}
          disabled={disabled}
          label={ariaLabel}
          onChange={onValueChange}
          options={options}
          selectedKey={value != null ? String(value) : ''}
          testId={getOptionTestId}
          variant={variant}
        />
      </div>
      {description || invalid ? (
        <div className={classNames.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classNames.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classNames.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default RadioTabsControl;
