import { useContext } from 'react';
import { TimeFieldStateContext } from 'react-aria-components';

import { useWatchFormReset } from '../../hooks/useWatchFormReset';

/** Partial edits do not change the controlled null value, so reset them explicitly. */
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
