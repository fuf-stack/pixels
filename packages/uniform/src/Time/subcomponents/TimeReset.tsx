import { useContext } from 'react';
import { TimeFieldStateContext } from 'react-aria-components';

import { useWatchFormReset } from '../../hooks/useWatchFormReset';

/**
 * Clears partial segment edits when the form resets an empty field
 *
 * @see https://react-aria.adobe.com/TimeField
 */
const TimeReset = () => {
  const state = useContext(TimeFieldStateContext);

  useWatchFormReset({
    onReset: () => {
      if (state?.value == null) {
        state?.setValue(null);
      }
    },
  });

  return null;
};

export default TimeReset;
