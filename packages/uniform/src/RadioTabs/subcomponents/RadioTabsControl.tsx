import type { UniformField } from '../../hooks/useUniformField/types';
import type { RadioTabsProps } from '../RadioTabs';

import { useFocusWithin } from 'react-aria/useFocusWithin';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../../helpers';
import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { radioTabsVariants } from '../radioTabsVariants';
import RadioTabsList from './RadioTabsList';

interface RadioTabsControlProps extends Pick<
  RadioTabsProps,
  'className' | 'fullWidth' | 'inline' | 'options' | 'variant'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string | number | boolean>;
}

/**
 * Tab selection presentation with group messages and keyboard focus routing
 *
 * @see https://react-aria.adobe.com/Tabs
 */
const RadioTabsControl = ({
  field,
  className,
  fullWidth,
  inline,
  options,
  variant,
}: RadioTabsControlProps) => {
  const {
    ariaLabel,
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
    value,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const styling = useStyling();
  const { focusWithinProps } = useFocusWithin({ onBlurWithin: onBlur });

  // check if any option has content
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/promise-function-async
  const hasContent = options.some((option) => {
    return option.content;
  });

  const { convertToOriginalType } = createOptionValueConverter(options);

  // classNames from slots
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

  // restore the selected option's original value type
  const handleChange = (nextValue: string) => {
    onValueChange(convertToOriginalType(nextValue));
  };

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
    <FieldLayout
      baseProps={{
        ...associations,
        ...focusWithinProps,
        'aria-describedby': describedBy,
        'data-component': 'radio-tabs',
        'data-invalid': invalid,
        'data-required': required,
        'data-testid': testId,
        ref: handleControlRef,
        role: 'group',
      }}
      className={classNames}
      description={description}
      errorMessage={errorMessage}
      ids={ids}
      invalid={invalid}
      label={label}
      labelAs="div"
      required={required}
    >
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}

      {/* selectable tabs */}
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
          onChange={handleChange}
          options={options}
          selectedKey={value != null ? String(value) : ''}
          testId={getOptionTestId}
          variant={variant}
        />
      </div>
    </FieldLayout>
  );
};

export default RadioTabsControl;
