import { useContext } from 'react';
import { DateFieldStateContext } from 'react-aria-components';

import { useWatchFormReset } from '../../hooks/useWatchFormReset';

/**
 * Clears partial segment edits when the form resets an empty field
 *
 * @see https://react-aria.adobe.com/DatePicker
 */
const DatePickerReset = () => {
  const state = useContext(DateFieldStateContext);

  useWatchFormReset({
    onReset: () => {
      if (state?.value == null) {
        state?.setValue(null);
      }
    },
  });

  return null;
};

export default DatePickerReset;
