import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { forwardRef } from 'react';

import {
  Card as HeroCard,
  CardBody as HeroCardBody,
  CardFooter as HeroCardFooter,
  CardHeader as HeroCardHeader,
} from '@heroui/card';
import { Divider as HeroDivider } from '@heroui/divider';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// card styling variants
export const cardVariants = tv({
  slots: {
    base: 'border border-divider',
    body: '',
    divider: 'my-0 border-divider',
    footer: '',
    header: 'text-base font-semibold',
  },
});

type VariantProps = TVProps<typeof cardVariants>;
type ClassName = TVClassName<typeof cardVariants>;

export interface CardProps extends VariantProps {
  /** card body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** footer content */
  footer?: ReactNode;
  /** header content */
  header?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Card component based on [HeroUI Card](https://www.heroui.com//docs/components/card)
 */
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
    // classNames from slots
    const variants = cardVariants();
    const { divider: dividerClassName, ...classNames } = variantsToClassNames(
      variants,
      className,
      'base',
    );

    const divider = <HeroDivider className={dividerClassName} />;

    return (
      <HeroCard
        classNames={classNames}
        data-testid={testId && `card_${testId}`}
        fullWidth
        radius="sm"
        ref={ref}
        shadow="none"
      >
        {header && (
          <>
            <HeroCardHeader data-testid={testId && `card_header_${testId}`}>
              {header}
            </HeroCardHeader>
            {divider}
          </>
        )}
        <HeroCardBody data-testid={testId && `card_body_${testId}`}>
          {children}
        </HeroCardBody>
        {footer && (
          <>
            {divider}
            <HeroCardFooter data-testid={testId && `card_footer_${testId}`}>
              {footer}
            </HeroCardFooter>
          </>
        )}
      </HeroCard>
    );
  },
);

export default Card;
