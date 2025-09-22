import type { FilterDisplayProps } from '../types';
import type { Config, Value } from './schema';

const Display = ({
  value,
  config: { text, textPrefix, textNoWord },
}: FilterDisplayProps<Config, Value>) => {
  if (typeof value === 'boolean') {
    return (
      <>
        {value ? textPrefix : `${textPrefix} ${textNoWord ?? 'no'}`} {text}
      </>
    );
  }
  return <>{`${text}...`}</>;
};

export default Display;
