import type { ReactNode, Ref } from 'react';

import { createRef } from 'react';

import FieldLayout from '../../src/partials/FieldLayout/FieldLayout';

interface RequiredBaseProps {
  /** Base content */
  children: ReactNode;
  /** CSS class name */
  className?: string;
  /** Field name */
  name: string;
  /** Callback with the selected value */
  onChange: (value: string) => void;
  /** Base element ref */
  ref?: Ref<HTMLDivElement>;
}

const RequiredBase = ({
  children,
  className = undefined,
  name,
  onChange,
  ref = undefined,
}: RequiredBaseProps) => {
  const handleChange = () => {
    onChange(name);
  };

  return (
    <div ref={ref} className={className} onChange={handleChange}>
      {children}
    </div>
  );
};

const layoutProps = {
  children: <input />,
  className: {},
  errorMessage: null,
  ids: {
    control: 'field',
    description: 'description',
    error: 'error',
    label: 'label',
  },
  invalid: false,
};
const baseProps = { name: 'choice', onChange: (_value: string) => {} };
const divRef = createRef<HTMLDivElement>();
const buttonRef = createRef<HTMLButtonElement>();

// the default div and bases with only optional props need no configuration
<FieldLayout {...layoutProps} />;
<FieldLayout {...layoutProps} baseAs="section" />;
<FieldLayout {...layoutProps} baseProps={{ ref: divRef, role: 'group' }} />;

// infer the required props and ref from the selected component
<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  baseProps={{ ...baseProps, ref: divRef }}
/>;

// @ts-expect-error the selected base requires its configuration
<FieldLayout {...layoutProps} baseAs={RequiredBase} />;

// @ts-expect-error undefined cannot replace required base props
<FieldLayout {...layoutProps} baseAs={RequiredBase} baseProps={undefined} />;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error the required name is missing
  baseProps={{ onChange: baseProps.onChange }}
/>;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error callbacks must accept the base component's string value
  baseProps={{ name: 'choice', onChange: (_value: number) => {} }}
/>;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error the base ref must target a div
  baseProps={{ ...baseProps, ref: buttonRef }}
/>;

// @ts-expect-error native bases also enforce their ref target
<FieldLayout {...layoutProps} baseAs="button" baseProps={{ ref: divRef }} />;

// @ts-expect-error baseProps cannot change the inferred default div into a link
<FieldLayout {...layoutProps} baseProps={{ href: '/example' }} />;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error unrelated props cannot widen the selected component
  baseProps={{ ...baseProps, href: '/example' }}
/>;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error the layout owns the base styling
  baseProps={{ ...baseProps, className: 'override' }}
/>;

<FieldLayout
  {...layoutProps}
  baseAs={RequiredBase}
  // @ts-expect-error the layout owns the base content
  baseProps={{ ...baseProps, children: null }}
/>;
