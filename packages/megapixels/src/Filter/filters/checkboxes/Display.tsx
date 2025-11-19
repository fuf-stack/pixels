import type { FilterDisplayProps } from '../types';
import type { Config, Value } from './schema';

/**
 * Read-only presentation for the checkboxes filter.
 * Resolves and displays selected option labels based on `value` and `config`.
 * Supports string, ReactNode, and function labels (mode: 'display').
 */
const Display = ({
  value,
  config: { text, options },
}: FilterDisplayProps<Config, Value>) => {
  if (value && value.length > 0) {
    return (
      <span className="flex items-center gap-1">
        {text} is
        {value.map((val) => {
          const option = options.find((op) => {
            return op.value === val;
          });
          const label = option?.label ?? val;
          const resolvedLabel =
            typeof label === 'function' ? label('display') : label;
          return <span key={val}>{resolvedLabel}</span>;
        })}
      </span>
    );
  }
  return `${text} is ...`;
};

export default Display;
