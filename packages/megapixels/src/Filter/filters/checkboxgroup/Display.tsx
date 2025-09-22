/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { FilterDisplayProps } from '../types';
import type { Config, Value } from './schema';

const Display = ({
  value,
  config: { text, options },
}: FilterDisplayProps<Config, Value>) => {
  if (value && value.length > 0) {
    const labels = value
      .map((val) => {
        return (
          options.find((op) => {
            return op.value === val;
          })?.label ?? val
        );
      })
      .join(', ');
    return `${text} is ${labels}`;
  }
  return `${text} is ...`;
};

export default Display;
