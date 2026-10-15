import type { ReactNode } from 'react';
import type useUniformFieldState from '../../hooks/useUniformFieldState/useUniformFieldState';

import { createContext, useContext, useId } from 'react';
import { Label, Radio, RadioGroup } from 'react-aria-components';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { FieldHints } from '../FieldLayout/FieldLayout';

type FieldState = ReturnType<typeof useUniformFieldState>;
const DescriptionContext = createContext<string | undefined>(undefined);

/** Shared group presentation; field state and value conversion stay with the renderer. */
export const RadioLayout = ({
  field,
  classes,
  inline,
  onChange,
  children,
}: {
  field: FieldState;
  classes: {
    base?: string;
    label?: string;
    wrapper?: string;
    errorMessage?: string;
  };
  inline: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) => {
  const associations = field.getControlProps();
  const { cn } = useStyling();
  return (
    <RadioGroup
      {...associations}
      aria-labelledby={undefined}
      render={(props) => (
        <div
          {...props}
          data-invalid={field.invalid}
          data-required={field.required}
        >
          {props.children}
        </div>
      )}
      ref={(node) => {
        field.ref(
          node
            ? {
                focus: () => {
                  const input =
                    node.querySelector<HTMLInputElement>(
                      'input:checked:not(:disabled)',
                    ) ??
                    node.querySelector<HTMLInputElement>(
                      'input:not(:disabled)',
                    );
                  input?.focus();
                },
              }
            : null,
        );
      }}
      className={cn('relative', classes.base)}
      data-invalid={field.invalid}
      data-required={field.required}
      data-slot="base"
      data-testid={field.testId}
      isDisabled={field.disabled}
      isInvalid={field.invalid}
      isRequired={field.required}
      name={field.field.name}
      onBlur={field.onBlur}
      onChange={onChange}
      orientation={inline ? 'horizontal' : 'vertical'}
      validationBehavior="aria"
      value={field.field.value != null ? String(field.field.value) : ''}
    >
      {field.label ? (
        <Label
          className={cn('relative', classes.label)}
          data-slot="label"
          id={field.ids.label}
        >
          {field.label}
          {field.required ? (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </Label>
      ) : null}
      <DescriptionContext.Provider value={associations['aria-describedby']}>
        <div
          className={classes.wrapper}
          data-orientation={inline ? 'horizontal' : 'vertical'}
          data-slot="wrapper"
        >
          {children}
        </div>
      </DescriptionContext.Provider>
      <FieldHints
        classes={{ ...classes, description: 'text-foreground-400 text-tiny' }}
        description={field.description}
        errorMessage={field.errorMessage}
        ids={field.ids}
        invalid={field.invalid}
      />
    </RadioGroup>
  );
};

export const radioControlVariants = tv({
  slots: {
    base: 'group relative -m-2 inline-flex max-w-fit cursor-pointer select-none items-center justify-start p-2 tap-highlight-transparent data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled',
    wrapper:
      'relative box-border inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-solid border-default transition-transform-colors group-data-[pressed=true]:scale-95 group-data-[invalid=true]:border-danger group-data-[invalid=true]:group-data-[selected=true]:border-danger group-data-[selected=true]:border-primary group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background motion-reduce:transition-none',
    control:
      'z-10 h-2 w-2 origin-center scale-0 rounded-full bg-primary text-primary-foreground opacity-0 transition-transform-opacity group-data-[selected=true]:scale-100 group-data-[invalid=true]:bg-danger group-data-[invalid=true]:text-danger-foreground group-data-[selected=true]:opacity-100 motion-reduce:transition-none',
    labelWrapper: 'ml-1 ms-2 flex flex-col',
    label:
      'relative select-none text-foreground transition-colors text-medium motion-reduce:transition-none',
    description:
      'relative text-foreground-400 transition-colors text-small motion-reduce:transition-none',
  },
  variants: {
    invalid: {
      true: {
        label: 'text-danger',
        description: 'text-danger-300',
        control: 'bg-danger text-danger-foreground',
        wrapper: 'border-danger group-data-[selected=true]:border-danger',
      },
    },
  },
});

export const RadioControl = ({
  value,
  disabled = undefined,
  invalid,
  classes,
  children,
  description = undefined,
  icon = undefined,
  testId = undefined,
}: {
  value: string;
  disabled?: boolean;
  invalid: boolean;
  classes: Record<string, string>;
  children: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  testId?: string;
}) => {
  const { cn } = useStyling();
  const id = useId();
  const groupDescription = useContext(DescriptionContext);
  const describedBy =
    [groupDescription, description ? `${id}-description` : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <Radio
      aria-describedby={describedBy}
      aria-labelledby={`${id}-label`}
      className={classes.base}
      data-invalid={invalid}
      data-slot="base"
      data-testid={testId}
      isDisabled={disabled}
      value={value}
      id={`${id}-control`}
      render={(props, state) => (
        <label
          {...props}
          data-focus={state.isFocused || undefined}
          data-hover={state.isHovered || undefined}
          data-hover-unselected={
            (state.isHovered && !state.isSelected) || undefined
          }
          htmlFor={`${id}-control`}
        >
          {props.children}
        </label>
      )}
    >
      {({ isHovered, isSelected }) => {
        const control = (
          <span
            aria-hidden
            className={cn(
              classes.wrapper,
              isHovered && !isSelected ? 'bg-default-100' : undefined,
            )}
            data-slot="wrapper"
          >
            <span className={classes.control} data-slot="control" />
          </span>
        );
        return (
          <>
            {!icon ? control : null}
            {icon ? <div className={classes.icon}>{icon}</div> : null}
            <div className={classes.labelWrapper} data-slot="label-wrapper">
              <span
                className={classes.label}
                data-slot="label"
                id={`${id}-label`}
              >
                {children}
              </span>
              {description ? (
                <div
                  className={classes.description}
                  data-slot="description"
                  id={`${id}-description`}
                >
                  {description}
                </div>
              ) : null}
            </div>
            {icon ? control : null}
          </>
        );
      }}
    </Radio>
  );
};
