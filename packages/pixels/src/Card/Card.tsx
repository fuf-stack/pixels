import type { ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import {
  Card as NextCard,
  CardBody as NextCardBody,
  CardFooter as NextCardFooter,
  CardHeader as NextCardHeader,
} from '@nextui-org/card';
import { Divider as NextDivider } from '@nextui-org/divider';

import { tv, variantsToClassNames } from '../utils';

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

type CardVariantProps = VariantProps<typeof cardVariants>;
type CardVariantSlots = Partial<
  Record<keyof ReturnType<typeof cardVariants>, string>
>;

export interface CardProps extends CardVariantProps {
  /** card body content */
  children?: ReactNode;
  /** CSS class name */
  className?: string | CardVariantSlots;
  /** footer content */
  footer?: ReactNode;
  /** header content */
  header?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Card component based on [NextUI Card](https://nextui.org/docs/components/card)
 */
const Card = ({
  children = null,
  className = undefined,
  testId = undefined,
  header = undefined,
  footer = undefined,
}: CardProps) => {
  // classNames from slots
  const variants = cardVariants();
  const { divider: dividerClassName, ...classNames } = variantsToClassNames(
    variants,
    className,
    'base',
  );

  const divider = <NextDivider className={dividerClassName} />;

  return (
    <NextCard
      classNames={classNames}
      data-testid={testId && `card_${testId}`}
      fullWidth
      radius="sm"
      shadow="none"
    >
      {header && (
        <>
          <NextCardHeader data-testid={testId && `card_header_${testId}`}>
            {header}
          </NextCardHeader>
          {divider}
        </>
      )}
      <NextCardBody data-testid={testId && `card_body_${testId}`}>
        {children}
      </NextCardBody>
      {footer && (
        <>
          {divider}
          <NextCardFooter data-testid={testId && `card_footer_${testId}`}>
            {footer}
          </NextCardFooter>
        </>
      )}
    </NextCard>
  );
};

export default Card;
