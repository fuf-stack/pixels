import type { HTMLAttributes, ReactNode } from 'react';
import type { ModalClassNames } from '../modalVariants';

interface ModalSectionsProps {
  /** ID associating the dialog with its body */
  bodyId: string;
  /** Dialog body content */
  children: ReactNode;
  /** CSS class name */
  className: ModalClassNames;
  /** Optional actions below the body */
  footer?: ReactNode;
  /** Optional title above the body */
  header?: ReactNode;
  /** Props associating the heading with the dialog */
  titleProps: HTMLAttributes<HTMLElement>;
}

/** Heading, scrollable body and footer inside a modal dialog */
const ModalSections = ({
  bodyId,
  children,
  className: classNames,
  footer = undefined,
  header = undefined,
  titleProps,
}: ModalSectionsProps) => {
  return (
    <>
      {/* optional heading */}
      {header ? (
        <header
          {...titleProps}
          className={classNames.header}
          data-slot="header"
        >
          {header}
        </header>
      ) : null}

      {/* scrollable body */}
      <div className={classNames.body} data-slot="body" id={bodyId}>
        {children}
      </div>

      {/* optional actions */}
      {footer ? (
        <footer className={classNames.footer} data-slot="footer">
          {footer}
        </footer>
      ) : null}
    </>
  );
};

export default ModalSections;
