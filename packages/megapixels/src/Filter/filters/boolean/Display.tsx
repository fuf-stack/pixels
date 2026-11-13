import type { FilterDisplayProps } from '../types';
import type { Config, Value } from './schema';

/**
 * Read-only presentation for the boolean filter.
 * Displays human-readable text based on the current boolean `value`
 * and the provided `config` strings.
 */
const Display = ({
  value,
  config: { text, textPrefix, textNoWord },
}: FilterDisplayProps<Config, Value>) => {
  if (typeof value === 'boolean') {
    const prefix = value ? textPrefix : `${textPrefix} ${textNoWord ?? 'no'}`;
    return <>{`${prefix} ${text}`}</>;
  }
  return <>{`${text}...`}</>;
};

export default Display;
