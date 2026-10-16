import type { ReactNode } from 'react';
import type { ClassName } from './fieldCardVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import useFieldCardValidation from './hooks/useFieldCardValidation';
import FieldCardControl from './subcomponents/FieldCardControl';

export { fieldCardVariants } from './fieldCardVariants';
export {
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from './fieldCardValidation';

export interface FieldCardProps {
  /** Content to render inside the card */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Field label */
  label: ReactNode;
  /** Field name */
  name: string;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Form field group displayed as a card with a heading and validation footer */
const FieldCard = ({
  children,
  className: _className = undefined,
  name,
  ...uniformFieldProps
}: FieldCardProps) => {
  const { field } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  const validation = useFieldCardValidation(field);

  return (
    <FieldCardControl
      className={_className}
      field={{ ...field, ...validation }}
    >
      {children}
    </FieldCardControl>
  );
};

export default FieldCard;
