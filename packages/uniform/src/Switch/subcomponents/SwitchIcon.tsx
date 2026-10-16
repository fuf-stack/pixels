import type { ReactNode } from 'react';

import { cloneElement, isValidElement } from 'react';

interface SwitchIconProps {
  /** Icon content */
  children: ReactNode;
  /** CSS class name */
  className: string;
}

/** Applies switch icon dimensions and slot styling to an element */
const SwitchIcon = ({ children, className }: SwitchIconProps) => {
  return (
    <>
      {isValidElement<{ className?: string; width?: string; height?: string }>(
        children,
      )
        ? cloneElement(children, { width: '1em', height: '1em', className })
        : children}
    </>
  );
};

export default SwitchIcon;
