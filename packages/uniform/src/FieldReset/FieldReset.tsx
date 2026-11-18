import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { FieldResetInclude } from './helpers/fieldResetValues';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useFormContext as useRHFContext,
  useWatch as useRHFWatch,
} from 'react-hook-form';

import { tv } from '@fuf-stack/pixel-utils';
import { useIsInitialRenderCycle } from '@fuf-stack/pixels';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { toNullishString } from '../helpers';
import { useFormContext } from '../hooks/useFormContext';
import createFieldResetTransform from './helpers/createFieldResetTransform';
import {
  isFieldValueChanged,
  isOriginalEqual,
  toFormFieldValue,
} from './helpers/fieldResetValues';
import FieldResetAction from './subcomponents/FieldResetAction';

/** Styles the field wrapper and its change announcement */
export const fieldResetVariants = tv({
  slots: {
    /** Screen-reader announcement of a changed value */
    announcement: 'sr-only',
    /** Container around the field and its reset action */
    base: 'min-w-0',
  },
});

type ClassName = TVClassName<typeof fieldResetVariants>;

export interface FieldResetRenderProps<TDisplay = string> {
  /** Supplies the reset action for endContent or another field slot */
  resetAction: ReactNode;
  /** Converts between displayed values and submitted updates */
  transform: InputValueTransform<TDisplay>;
}

export interface FieldResetProps<TDisplay = string> {
  /** Announces the changed state to assistive technology; defaults to Changed */
  changedLabel?: string;
  /** Callback invoked to render the field with its transform and reset action */
  children: (props: FieldResetRenderProps<TDisplay>) => ReactNode;
  /** Applies CSS classes to the field wrapper and announcement slots */
  className?: ClassName;
  /** Disables the reset action without changing the child field's disabled state */
  disabled?: boolean;
  /** Includes only changed values by default, or always includes the field */
  include?: FieldResetInclude;
  /** Identifies the field to initialize, compare, and reset */
  name: string;
  /** Labels the reset icon button and its tooltip; defaults to Reset to original */
  resetLabel?: string;
  /** Supplies the non-null reset destination and comparison value for changed-only inclusion */
  resetValue: NonNullable<unknown>;
}

/** Tracks a field against its original value, shows reset, and controls payload inclusion */
const FieldReset = <TDisplay = string,>({
  changedLabel = 'Changed',
  children,
  className = undefined,
  disabled = false,
  include = 'changed',
  name,
  resetLabel = 'Reset to original',
  resetValue,
}: FieldResetProps<TDisplay>) => {
  const styling = useStyling();
  const {
    control,
    formReset,
    register,
    resetField,
    setValue,
    setFocus,
    trigger,
  } = useFormContext();

  // read raw values to distinguish the omitted marker from explicit clears and
  // preserve stored array wrappers, Uniform's getValues normalizes these away
  const { getValues } = useRHFContext();
  const storedValue = useRHFWatch({ control, name });
  const previous = useRef<{ name: string; original: typeof resetValue } | null>(
    null,
  );

  // keep equivalent object props stable without requiring callers to memoize them
  const [baseline, setBaseline] = useState(() => {
    return resetValue;
  });
  if (!isOriginalEqual(baseline, resetValue)) {
    setBaseline(() => {
      return resetValue;
    });
  }

  // use Uniform's existing null marker for an unchanged update. A real null
  // remains a clear (e.g. Input's clear button), rather than showing the original
  const omittedValue = toNullishString(null);
  const transform = useMemo(() => {
    return createFieldResetTransform<TDisplay>({
      resetValue: baseline,
      include,
      storedValue,
    });
  }, [baseline, include, storedValue]);

  // apply omission to imperative setValue calls before validation or submission,
  // including calls that submit immediately without waiting for a render
  const registerValueConversion = useCallback(() => {
    register(name, {
      setValueAs: (nextValue: unknown) => {
        return include === 'changed' &&
          !isFieldValueChanged(nextValue, baseline)
          ? omittedValue
          : nextValue;
      },
    });
  }, [baseline, include, name, omittedValue, register]);

  // install the field-local conversion and release it when this wrapper changes
  // or unmounts, leaving ordinary controllers free of the omission policy
  useEffect(() => {
    registerValueConversion();
    return () => {
      // remove the conversion even when the current value is undefined
      // the controller remains responsible for its own unregistration
      register(name, { setValueAs: undefined });
    };
  }, [name, register, registerValueConversion]);

  // reset the field and its default to the baseline in always mode, or to the
  // omitted marker in changed mode so the transform displays the baseline
  const restoreOriginal = useCallback(() => {
    resetField(name, {
      defaultValue:
        include === 'always' ? toFormFieldValue(baseline) : omittedValue,
    });
  }, [baseline, include, name, omittedValue, resetField]);

  // initialize the field and synchronize changes to its reset value or inclusion
  // mode. Preserve edits unless they match the new baseline, then revalidate
  useEffect(() => {
    const prior = previous.current;
    const current = getValues(name);
    const keepEdit =
      prior?.name === name &&
      current !== omittedValue &&
      current !== undefined &&
      isFieldValueChanged(current, prior.original) &&
      isFieldValueChanged(current, baseline);
    restoreOriginal();
    if (keepEdit) {
      setValue(name, current, { shouldDirty: true, shouldValidate: true });
    }
    previous.current = { name, original: baseline };
    trigger();
  }, [
    baseline,
    getValues,
    name,
    omittedValue,
    restoreOriginal,
    setValue,
    trigger,
  ]);

  // RHF clears registration on a form reset. Reinstall conversion while letting
  // the supplied reset values and defaults remain owned by the form
  useEffect(() => {
    return formReset.subscribe(registerValueConversion);
  }, [formReset, registerValueConversion]);

  // handle the reset action: restore the baseline, return focus to the field,
  // and refresh its validation result
  const handleReset = useCallback(() => {
    restoreOriginal();
    setFocus(name);
    trigger(name);
  }, [name, restoreOriginal, setFocus, trigger]);

  // the original is installed after mount. Do not briefly render a reset action
  // for the pre-initialized RHF value
  const isInitialRender = useIsInitialRenderCycle();
  const value =
    storedValue === omittedValue || storedValue === undefined
      ? toFormFieldValue(baseline)
      : storedValue;
  const isChanged = !isInitialRender && isFieldValueChanged(value, baseline);
  const resetAction = (
    <FieldResetAction
      disabled={disabled}
      isChanged={isChanged}
      name={name}
      onReset={handleReset}
      resetLabel={resetLabel}
    />
  );

  // classNames from slots
  const variants = styling.resolve(fieldResetVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      className={classNames.base}
      data-changed={isChanged || undefined}
      data-component="field-reset"
      data-slot="base"
    >
      {children({ resetAction, transform })}
      <span
        aria-live="polite"
        className={classNames.announcement}
        data-slot="announcement"
      >
        {isChanged ? changedLabel : ''}
      </span>
    </div>
  );
};

export default FieldReset;
