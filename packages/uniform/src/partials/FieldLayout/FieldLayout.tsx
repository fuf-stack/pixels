import type { ReactNode } from 'react';
import type useUniformFieldState from '../../hooks/useUniformFieldState/useUniformFieldState';

type FieldState = ReturnType<typeof useUniformFieldState>;

/** Local presentation only. Registration and error timing remain in the shared hook. */
export const FieldLabel = ({
  ids,
  label,
  required,
  className = undefined,
}: {
  ids: FieldState['ids'];
  label: ReactNode;
  required: boolean;
  className?: string;
}) => {
  if (!label) {
    return null;
  }
  return (
    <label
      className={className}
      data-slot="label"
      htmlFor={ids.control}
      id={ids.label}
    >
      {label}
      {required ? (
        <span aria-hidden className="ml-0.5 text-danger">
          *
        </span>
      ) : null}
    </label>
  );
};

export const FieldHints = ({
  ids,
  description = undefined,
  invalid,
  errorMessage,
  classes,
}: {
  ids: FieldState['ids'];
  description?: ReactNode;
  invalid: boolean;
  errorMessage: ReactNode;
  classes: {
    description?: string;
    helperWrapper?: string;
    errorMessage?: string;
  };
}): ReactNode => {
  if (!description && !invalid) {
    return null;
  }
  return (
    <div className={classes.helperWrapper} data-slot="helper-wrapper">
      {description ? (
        <div
          className={classes.description}
          data-slot="description"
          id={ids.description}
        >
          {description}
        </div>
      ) : null}
      {invalid ? (
        <div
          className={classes.errorMessage}
          data-slot="error-message"
          id={ids.error}
        >
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};
