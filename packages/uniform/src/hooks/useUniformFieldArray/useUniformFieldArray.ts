import type { FieldValues, Path } from 'react-hook-form';
import type { UseUniformFieldArrayProps } from './useUniformFieldArrayState';

import { useUniformField } from '../useUniformField';
import { useUniformFieldArrayMethods } from './useUniformFieldArrayState';

export type { UseUniformFieldArrayProps } from './useUniformFieldArrayState';

/** Preserve legacy presentation getters for public array-hook consumers. */
export const useUniformFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
>(
  params: UseUniformFieldArrayProps<TFieldValues>,
) => {
  const field = useUniformField<TFieldValues>({
    ...params,
    name: params.name as Path<TFieldValues> & string,
  });
  return { ...useUniformFieldArrayMethods(params, field), ...field };
};
