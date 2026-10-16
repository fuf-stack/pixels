import type { UniformField } from '../../hooks/useUniformField/types';
import type { TimeValue } from '../timeHelpers';
import type { TimeClassNames } from '../timeVariants';

import { DateInput, DateSegment } from 'react-aria-components';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';

interface TimeInputProps {
  /** CSS class name */
  className: TimeClassNames;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, TimeValue>;
}

/**
 * Editable time segments and supporting messages inside a TimeField
 *
 * @see https://react-aria.adobe.com/TimeField
 */
const TimeInput = ({ className: classNames, field }: TimeInputProps) => {
  const { description, errorMessage, ids, invalid, testId } = field;

  return (
    <div className={classNames.inputWrapper} data-slot="input-wrapper">
      <div className={classNames.innerWrapper} data-slot="inner-wrapper">
        <DateInput
          className={classNames.input}
          data-slot="input"
          data-testid={testId}
        >
          {(segment) => {
            return (
              <DateSegment
                className={classNames.segment}
                data-editable={segment.isEditable || undefined}
                data-slot="segment"
                data-type={segment.type}
                segment={segment}
              />
            );
          }}
        </DateInput>
      </div>

      {/* help text and validation messages */}
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

export default TimeInput;
