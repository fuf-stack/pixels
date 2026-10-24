import type { ReactNode } from 'react';
import type { ClassName } from './cardVariants';

import { forwardRef } from 'react';
import { useFocusRing } from 'react-aria';

import { useStyling } from '../StylingProvider';
import { cardVariants } from './cardVariants';

export { cardVariants } from './cardVariants';

export interface CardProps {
  /** Main content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Supporting content below the body */
  footer?: ReactNode;
  /** Heading content above the body */
  header?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Bordered content surface with an optional heading and footer */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children = null,
      className = undefined,
      footer = undefined,
      header = undefined,
      testId = undefined,
    },
    ref,
  ) => {
    const styling = useStyling();
    const { focusProps, isFocused, isFocusVisible } = useFocusRing();

    // classNames from slots
    const variants = styling.resolve(cardVariants);
    const classNames = styling.variantsToClassNames(
      variants,
      className,
      'base',
    );

    return (
      <div
        {...focusProps}
        ref={ref}
        className={classNames.base}
        data-component="card"
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-slot="base"
        data-testid={testId ? `card_${testId}` : undefined}
        tabIndex={-1}
      >
        {/* optional heading and its divider */}
        {header ? (
          <>
            <div
              className={classNames.header}
              data-slot="header"
              data-testid={testId ? `card_header_${testId}` : undefined}
            >
              {header}
            </div>
            <hr className={classNames.divider} />
          </>
        ) : null}

        {/* main content */}
        <div
          className={classNames.body}
          data-slot="body"
          data-testid={testId ? `card_body_${testId}` : undefined}
        >
          {children}
        </div>

        {/* optional footer and its divider */}
        {footer ? (
          <>
            <hr className={classNames.divider} />
            <div
              className={classNames.footer}
              data-slot="footer"
              data-testid={testId ? `card_footer_${testId}` : undefined}
            >
              {footer}
            </div>
          </>
        ) : null}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
